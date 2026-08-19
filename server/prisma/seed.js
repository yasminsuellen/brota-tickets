require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

async function main() {
    const password = await bcrypt.hash('senha123', 10);

    const organizador = await prisma.user.create({
        data: {
            name: 'Organizador Teste',
            email: 'organizador@brotatickets.com',
            password,
            role: 'ORGANIZADOR'
        }
    });

    const cliente1 = await prisma.user.create({
        data: {
            name: 'Cliente Um',
            email: 'cliente1@brotatickets.com',
            password,
            role: 'CLIENTE'
        }
    });

    const cliente2 = await prisma.user.create({
        data: {
            name: 'Cliente Dois',
            email: 'cliente2@brotatickets.com',
            password,
            role: 'CLIENTE'
        }
    });

    const portaria = await prisma.user.create({
        data: {
            name: 'Portaria Teste',
            email: 'portaria@brotatickets.com',
            password,
            role: 'PORTARIA'
        }
    });

    const event = await prisma.event.create({
        data: {
            title: 'Show de Teste',
            date: new Date('2026-12-01T20:00:00Z'),
            location: 'Local de Teste',
            capacity: 100,
            price: 50.0,
            organizerId: organizador.id
        },
    });

    console.log(
        'Seed complete:',
        { organizador, cliente1, cliente2, portaria, event }
    );
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });