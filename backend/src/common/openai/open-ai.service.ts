import { Injectable } from "@nestjs/common";
import * as https from "https";
import * as FormData from "form-data";
import * as fs from "node:fs";
import * as dotenv from "dotenv";
import { TextDTO } from "../dtos/util-ride.dto";

dotenv.config();

@Injectable()
export class OpenAIService {
  private readonly openaiApiKey: string;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  async transcribeAudio(filePath: string): Promise<any> {
    const prompt =
      "Extract the scheduled time, pickup location, and destination location from the audio transcription.";

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("model", "whisper-1");
    form.append("prompt", prompt);

    const options = {
      hostname: "api.openai.com",
      port: 443,
      path: "/v1/audio/transcriptions",
      method: "POST",
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
    };
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const response = JSON.parse(data);
            resolve(this.extractRideData(response.text));
          } catch (error) {
            reject(new Error(`Error parsing response: ${error.message}`));
          } finally {
            fs.unlink(filePath, () => {});
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      form.pipe(req);
    });
  }

  async extractRideData(transcriptionText: string): Promise<any> {
    return await this.getPostProcessedData(transcriptionText);
  }

  async chatGpt(textDTO: TextDTO): Promise<any> {
    const userPrompt = `Text is a place where the user is located: ${textDTO.text}`;
    const systemPrompt = `
    Please identify the language of the text and present a list of tourist places that the user could visit. The response should be formatted as JSON, as follows:
    [
      {
        "place": "Place to visit.",
        "address": "Directions to get to the place.",
        "description": "Description of what the place is and what can be done when visiting it."
      }
    ]
    `;

    const requestBody = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: userPrompt },
        { role: "system", content: systemPrompt },
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const options = {
      hostname: "api.openai.com",
      port: 443,
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          const response = JSON.parse(data);
          console.log(response.choices[0].message.content);
          resolve(response.choices[0].message.content);
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.write(requestBody);
      req.end();
    });
  }

  private async getPostProcessedData(text: string): Promise<any> {
    const userPrompt = `current date reference ${new Date()} , text information: ${text} `;
    const systemPrompt =
      "Please identify the language of the text and extract the relevant information. The response should be formatted as JSON, as follows:\n" +
      "{\n" +
      '  "pickup_location": "The starting point of the trip, provided as accurately as possible.",\n' +
      '  "destination_location": "The arrival point of the trip, provided as accurately as possible.",\n' +
      '  "scheduled_time": "The departure time of the trip, formatted in ISO 8601 (YYYY-MM-DDTHH:mm).\n' +
      "}";

    const requestBody = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: userPrompt },
        { role: "system", content: systemPrompt },
      ],
      max_tokens: 250,
      temperature: 0.5,
    });

    const options = {
      hostname: "api.openai.com",
      port: 443,
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          const response = JSON.parse(data);
          resolve(response.choices[0].message.content);
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.write(requestBody);
      req.end();
    });
  }
}
