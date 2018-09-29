#!/usr/bin/env node

const express = require('express')
const shell = require('shelljs')
const program = require('commander')

const requiredCommands = [
    'git',
    'docker'
]

requiredCommands.map((cmd) => {
    if (!shell.which(cmd)) {
        shell.echo(`Sorry, this script requires ${cmd}`)
        shell.exit(1)
    }
})

const CONTAINER = 'hbrcontainer'

const hookbuildrun = (url) => {
    shell.exec('sudo docker stop $(sudo docker ps -a -q)')

    shell.echo("> building image")
    shell.exec(`sudo docker build -t ${CONTAINER} ${url}`)
    shell.echo('> running image as daemon')
    shell.exec(`sudo docker run -p 3000:3000 -p 80:80 -d ${CONTAINER}`) // run as daemon
    return true //TODO return false if failed
}

program
    .version('xyz')
    .usage('<url> [options]')
    .option('-p, --port <n>', 'Set the port number', 3111, parseInt)
    .option('-r, --route <route>', 'Set the route', 'hook')
    .parse(process.argv)

const PORT = program.port
const HOST = "http://localhost"
const ROUTE = program.route
const URL = program.args[0]

const app = express()

app.post(`/${ROUTE}`, (req, res) => {
    console.log("> hooked, now building and running")
    const ret = hookbuildrun
    res.send("200") //TODO deal with failures and successes
})

app.listen(PORT, (err) => {
    if (err) throw err
    console.log(`> hookbuildrun server running. Webhook: ${HOST}:${PORT}/${ROUTE}`)
    hookbuildrun(URL)
})
