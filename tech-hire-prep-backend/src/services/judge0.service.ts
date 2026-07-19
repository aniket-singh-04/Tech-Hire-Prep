import { ENV } from "../config/envConfig.ts";

const judge0Headers = {
  "Content-Type": "application/json",
  "X-RapidAPI-Key": ENV.JUDGE0_KEY,
  "X-RapidAPI-Host": ENV.JUDGE0_HOST,
};


export const submitCodeToJudge0 = async ({
  code,
  languageId,
  input = "",
}: {
  code: string;
  languageId: number;
  input?: string;
}) => {

  const response = await fetch(
    `${ENV.JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
    {
      method: "POST",
      headers: judge0Headers,
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: input,
        cpu_time_limit: 2,
        memory_limit: 128000,
      }),
    }
  );


  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Judge0 submission failed: ${error}`);
  }


  return await response.json();
};

export const getJudge0Result = async (
  token: string,
) => {

  const response = await fetch(
    `${ENV.JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
    {
      method: "GET",
      headers: judge0Headers,
    }
  );


  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Judge0 result fetch failed: ${error}`);
  }


  return await response.json();
};
