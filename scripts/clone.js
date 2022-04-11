#!/bin/env node
const { Command } = require("commander")
const program = new Command()
const puppeteer = require("puppeteer")
const fs = require("fs")

program
    .name("lft - clone")
    .description("CLI to clone login pages")
    .version("1.5.0")

program.command("clone")
    .description("clone page by url")
    .argument("<url>", "url to clone")
    .option("-m, --mhtml", "clone pages with snapshot mhtml")
    .action(async (url, options) => {
        if (options.mhtml) {
            console.log("[info] starting clone tool (snapshot mhtml mode)")

            try {
                console.log("[debug] opening browser")
                const browser = await puppeteer.launch()
                const [page] = await browser.pages()

                console.log(`[debug] going to ${url}`)
                await page.goto(url)
                await page.waitForSelector("input")

                console.log("[debug] creating cdp session ")
                const cdp = await page.target().createCDPSession()
                const { data } = await cdp.send("Page.captureSnapshot", { format: "mhtml" })

                console.log("[debug] saving mhtml ")
                fs.writeFileSync("clone.mhtml", data)

                await browser.close()
                console.log("[info] cloning completed, page saved successfully")
                return
            } catch (err) {
                console.error(`[err] ${err}`)
            }
        } else {
            console.log("[info] starting clone tool (simple html mode)")
            try {
                console.log("[debug] opening browser")
                const browser = await puppeteer.launch()
                const [page] = await browser.pages()

                console.log(`[debug] going to ${url}`)
                await page.goto(url)
                await page.waitForSelector("input")

                console.log("[debug] getting html source code")
                const html = await page.content()
                await browser.close()

                console.log("[debug] saving html ")
                fs.writeFileSync("clone.html", html)

                console.log("[info] cloning completed, page saved successfully")
                return
            } catch (err) {
                console.error(`[err] ${err}`)
            }

        }
    })

program.parse(process.argv)
