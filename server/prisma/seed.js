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

    const eventsData = [
        {
            title: 'Sertanejo Universitário ao Vivo',
            category: 'Shows',
            description: 'Uma noite de sertanejo raiz e universitário com bandas convidadas.',
            imageUrl: 'https://picsum.photos/seed/brota-sertanejo/640/360',
            date: new Date('2026-10-03T21:00:00Z'),
            location: 'Parque de Exposições - Uberlândia, MG',
            capacity: 600,
            price: 90.0,
        },
        {
            title: 'O Auto da Compadecida',
            category: 'Teatro',
            description: 'Clássico do teatro brasileiro em uma nova montagem.',
            imageUrl: 'https://picsum.photos/seed/brota-compadecida/640/360',
            date: new Date('2026-09-12T20:00:00Z'),
            location: 'Teatro Municipal - Belo Horizonte, MG',
            capacity: 150,
            price: 60.0,
        },
        {
            title: 'Festival Brota Sound',
            category: 'Festivais',
            description: 'Dois dias de música com line-up nacional e internacional.',
            imageUrl: 'https://picsum.photos/seed/brota-sound/640/360',
            date: new Date('2026-11-14T18:00:00Z'),
            location: 'Arena Fonte Nova - Salvador, BA',
            capacity: 1000,
            price: 180.0,
        },
        {
            title: 'Stand-up: Rir é o Melhor Remédio',
            category: 'Shows',
            description: 'Comédia stand-up com os maiores nomes da cena atual.',
            imageUrl: 'https://picsum.photos/seed/brota-standup/640/360',
            date: new Date('2026-09-27T21:30:00Z'),
            location: 'Casa de Shows Downtown - São Paulo, SP',
            capacity: 90,
            price: 45.0,
        },
        {
            title: 'Festa Junina do Brota',
            category: 'Festas',
            description: 'Quadrilha, comidas típicas e muito forró.',
            imageUrl: 'https://picsum.photos/seed/brota-junina/640/360',
            date: new Date('2026-09-05T19:00:00Z'),
            location: 'Clube Recreativo - Campinas, SP',
            capacity: 400,
            price: 30.0,
        },
        {
            title: 'Sinfonia sob as Estrelas',
            category: 'Teatro',
            description: 'Orquestra sinfônica em uma apresentação ao ar livre.',
            imageUrl: 'https://picsum.photos/seed/brota-sinfonia/640/360',
            date: new Date('2026-10-24T20:00:00Z'),
            location: 'Theatro Municipal - Rio de Janeiro, RJ',
            capacity: 180,
            price: 120.0,
        },
    ];

    const events = [];

    for (const data of eventsData) {
        events.push(
            await prisma.event.create({
                data: { ...data, organizerId: organizador.id },
            })
        );
    }

    console.log(
        'Seed complete:',
        { organizador, cliente1, cliente2, portaria, events }
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