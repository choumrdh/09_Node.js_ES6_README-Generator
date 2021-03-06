const fs = require("fs");
const axios = require("axios");
const inquirer = require("inquirer");
const util = require("util");
var generateMarkdown = require("./generateMarkdown")

const writeFileAsync = util.promisify(fs.writeFile);

function createPromptModule() {
    return inquirer.prompt(questions)
}

function gitHubInfo(data) {
    const queryUrl = `https://api.github.com/users/${data.github}/events/public`
    return axios
        .get(queryUrl)

}

const questions = [
    {
        type: "input",
        name: "name",
        message: "What is your name?"
    }, {
        type: "input",
        name: "title",
        message: "what is the title of the project?",
    }, {
        type: "input",
        name: "description",
        message: "Description for the project"
    }, {
        type: "input",
        name: "story",
        message: "User story?"
    }, {
        type: "input",
        name: "installation",
        message: "Installation command(Press ENTER to skip)"
    }, {
        type: "input",
        name: "usage",
        message: "Usage command or instrcution(Press ENTER to skip)"
    }, {
        type: "input",
        name: "test",
        message: "Test Command (Press ENTER to skip)"
    }, {
        type: "input",
        name: "contribution",
        message: "Contribution (Press ENTER to skip)"
    }, {
        type: "list",
        name: "license",
        message: "What kind of license should your project have?",
        choices: ["MIT", "APACHE2.0", "GPL3.0", "BSD3", "None"]
    }, {
        type: "input",
        name: "github",
        message: "Please input your GitHub username"
    }, {
        type: "list",
        name: "emailAddress",
        message: "Would you like to display your email address?",
        choices: [
            "Yes",
            "No",
        ]
    }, {
        type: "list",
        name: "profilePic",
        message: "Would you like to display your GitHub profile avatar?",
        choices: [
            "Yes",
            "No"
        ]
    }

];

async function init() {
    console.log("Hi. Let me Gather some information to build your readMe file");

    try {
        const data = await createPromptModule()
        const gitHubData = await gitHubInfo(data)
        const response = gitHubData.data
        const avatar = response[0].actor.avatar_url
        data.avatar = avatar

        for (let i = 0; i < response.length; i++) {
            const info = response[i]
            if (info.payload && info.payload.commits) {
                const commits = info.payload.commits
                for (let j = 0; j < commits.length; j++) {
                    const commit = commits[j]
                    if (commit.author && commit.author.email) {
                        data.email = commit.author.email
                        break;
                    }
                }
            }
        }
        const readMe = generateMarkdown(data);
        await writeFileAsync("README.md", readMe);
        console.log("Successfully written readMe")
    } catch (err) {
        console.log(err + " Err from init function")
    }
}

init();
