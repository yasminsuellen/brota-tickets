const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const prisma = require('../lib/prisma');
const { getReservationType } = require('../utils/seatMap');
const { signQrToken } = require('../utils/qr');

router.get('/mine', requireAuth, requireRole('CLIENTE'), async (req, res) => {
    const reservations = await prisma.reservation.findMany({
        where: { userId: req.user.id, status: 'CONFIRMADA' },
        include: { ticket: true, event: true },
        orderBy: { event: { date: 'asc' } },
    });

    res.json({ reservations });
});

router.post('/', requireAuth, requireRole('CLIENTE'), async (req, res) => {
    const { eventId, seatCodes, quantity } = req.body;

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    const type = getReservationType(event.capacity);

    try {
        const reservations = await prisma.$transaction(async (tx) => {
            if (type === 'SEAT_MAP') {
                if (!Array.isArray(seatCodes) || seatCodes.length === 0) {
                    throw { status: 400, message: 'Selecione ao menos um assento.' };
                }

                const uniqueSeatCodes = [...new Set(seatCodes)];
                const created = [];

                for (const seatCode of uniqueSeatCodes) {
                    const taken = await tx.reservation.findFirst({
                        where: {
                            eventId,
                            seatCode,
                            status: { in: ['PENDENTE', 'CONFIRMADA'] },
                        },
                    });

                    if (taken) {
                        throw { status: 409, message: `O assento ${seatCode} já foi reservado.` };
                    }

                    created.push(
                        await tx.reservation.create({
                            data: { eventId, seatCode, status: 'PENDENTE', userId: req.user.id },
                        })
                    );
                }

                return created;
            }

            if (!quantity || Number(quantity) < 1) {
                throw { status: 400, message: 'Informe a quantidade de ingressos.' };
            }

            const existing = await tx.reservation.findMany({
                where: { eventId, status: { in: ['PENDENTE', 'CONFIRMADA'] } },
            });

            const sold = existing.reduce((sum, r) => sum + (r.quantity ?? 0), 0);

            if (sold + Number(quantity) > event.capacity) {
                throw { status: 409, message: 'Ingressos insuficientes para essa quantidade.' };
            }

            const reservation = await tx.reservation.create({
                data: { eventId, quantity: Number(quantity), status: 'PENDENTE', userId: req.user.id },
            });

            return [reservation];
        });

        res.status(201).json({ reservations });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }

        res.status(500).json({ error: 'Não foi possível criar a reserva.' });
    }
});

router.patch('/:id/pay', requireAuth, requireRole('CLIENTE'), async (req, res) => {
    const { decision } = req.body;

    if (decision !== 'confirm' && decision !== 'decline') {
        return res.status(400).json({ error: 'Decisão inválida.' });
    }

    const reservation = await prisma.reservation.findUnique({ where: { id: req.params.id } });

    if (!reservation || reservation.userId !== req.user.id) {
        return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    if (reservation.status !== 'PENDENTE') {
        return res.status(409).json({ error: 'Essa reserva já foi paga ou recusada.' });
    }

    if (decision === 'decline') {
        const updated = await prisma.reservation.update({
            where: { id: reservation.id },
            data: { status: 'RECUSADA' },
        });

        return res.json(updated);
    }

    const [updated] = await prisma.$transaction([
        prisma.reservation.update({
            where: { id: reservation.id },
            data: { status: 'CONFIRMADA' },
        }),
        prisma.ticket.create({
            data: {
                reservationId: reservation.id,
                qrToken: signQrToken(reservation.id),
            },
        }),
    ]);

    res.json(updated);
});

router.get('/:id/ticket', async (req, res) => {
    const reservation = await prisma.reservation.findUnique({
        where: { id: req.params.id },
        include: { ticket: true, event: true },
    });

    if (!reservation || reservation.status !== 'CONFIRMADA' || !reservation.ticket) {
        return res.status(404).json({ error: 'Ingresso não encontrado.' });
    }

    res.json(reservation);
});

module.exports = router;
