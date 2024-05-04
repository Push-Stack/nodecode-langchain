import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

import { config } from "dotenv";
import { program } from "commander";

config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY env variable");
}

program.option("-l, --language <language>", "Language", "NodeJS");
program.option(
  "-t, --task <task>",
  "Task",
  "Write a program that takes two numbers as input and calculates their sum."
);

program.parse(process.argv);
const options = program.opts();

const llm = new OpenAI({});

const chatTemplate = new PromptTemplate({
  inputVariables: ["language", "task"],
  template: "Write code in {language}. Your task is to: \n${task}",
});

const chatChain = chatTemplate.pipe(llm).pipe(new StringOutputParser());

const testCodeTemplate = new PromptTemplate({
  inputVariables: ["language", "code"],
  template: "Write a test for the following {language} code: \n${code}",
});

const combinedChains = RunnableSequence.from([
  { code: chatChain, language: (input) => input.language },
  testCodeTemplate,
  llm,
  new StringOutputParser(),
]);

const result = await combinedChains.invoke({
  language: options.language,
  task: options.task,
});

console.log(result);
