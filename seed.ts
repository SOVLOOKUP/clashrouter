import prisma from './server/utils/prisma'

async function seedData() {
  console.log('开始添加测试数据...')

  try {
    await prisma.subscription.deleteMany({})
    await prisma.airport.deleteMany({})
    console.log('✅ 清空旧数据')

    const airportA = await prisma.airport.create({
      data: {
        name: '测试机场 A',
        pluginType: 'generic',
        subUrl: 'https://example.com/sub-a',
        updateFrequency: 60,
        status: 'active',
        nodesJson: [
          'ss://YWVzLTI1Ni1nY206cGFzczEyMw==@sg1.example.com:10086#SG-1',
          'trojan://password@hk1.example.com:443?security=tls#HK-1'
        ],
        nodeCount: 2
      }
    })

    const airportB = await prisma.airport.create({
      data: {
        name: '测试机场 B',
        pluginType: 'generic',
        subUrl: 'https://example.com/sub-b',
        updateFrequency: 60,
        status: 'active',
        nodesJson: [
          'vmess://eyJhZGQiOiJqcDEuZXhhbXBsZS5jb20iLCJwb3J0IjoiNDQzIiwicHMiOiJKUC0xIn0='
        ],
        nodeCount: 1
      }
    })

    const subscription = await prisma.subscription.create({
      data: {
        name: '测试订阅',
        token: 'test_sub_' + Math.random().toString(36).slice(2, 10),
        description: '用于本地调试的测试订阅',
        airports: {
          connect: [{ id: airportA.id }, { id: airportB.id }]
        }
      },
      include: {
        airports: true
      }
    })

    console.log('✅ 创建机场:', airportA.name, ',', airportB.name)
    console.log('✅ 创建订阅:', subscription.name)
    console.log('✅ 订阅关联机场数量:', subscription.airports.length)
    console.log('\n✨ 测试数据添加完成！')
  } catch (error) {
    console.error('❌ 错误:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedData()
