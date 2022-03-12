const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера
// const teamName = "teamB" // Имя команды
const agent = new Agent() // Создание экземпляра агента
// Подключение модуля ввода из командной строки
const readline = require('readline')
const rl = readline.createInterface({ // Чтение консоли
    input: process.stdin,
    output: process.stdout
})

rl.question('Enter team name: ', teamName => {
    agent.teamName = teamName
    rl.question('Goalie? (y/n): ', isGk => {
        if (isGk === 'y') {
            agent.controller.setIsGk(true)
        }
        require('./socket')(agent, teamName, VERSION) //Настройка сокета
        rl.question('Enter coordinate x: ', x => {
            rl.question('Enter coordinate y: ', y => {
                agent.socketSend('move', `${x} ${y}`) // Размещение игрока на поле
            })
        })
    })

    // require('./socket')(agent, teamName, VERSION) //Настройка сокета
    // rl.question('Enter coordinate x: ', x => {
    //     rl.question('Enter coordinate y: ', y => {
    //         agent.socketSend('move', `${x} ${y}`) // Размещение игрока на поле
    //     })
    // })
})
// require('./socket')(agent, teamName, VERSION) //Настройка сокета

