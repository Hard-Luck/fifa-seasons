
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

async function main() {
    // Hash passwords
    const hashedPassword1 = await bcrypt.hash('password123', 10)
    const hashedPassword2 = await bcrypt.hash('password123', 10)

    // Create two users
    const user1 = await prisma.user.upsert({
        where: { name: 'player1' },
        update: {},
        create: {
            name: 'player1',
            password: hashedPassword1,
            prizeMoney: 0,
        },
    })

    const user2 = await prisma.user.upsert({
        where: { name: 'player2' },
        update: {},
        create: {
            name: 'player2',
            password: hashedPassword2,
            prizeMoney: 0,
        },
    })

    console.log('Created users:', { user1, user2 })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
