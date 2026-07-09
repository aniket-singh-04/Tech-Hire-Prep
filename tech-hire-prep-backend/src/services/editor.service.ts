import InterviewSessionModel from "../models/interviewSession.model.ts";
import { AppError } from "../utils/appError.ts";

/* -------------------------------------------------------------------------- */
/*                              Code Templates                                 */
/* -------------------------------------------------------------------------- */

const CODE_TEMPLATES: Record<string, string> = {
  javascript: `// JavaScript
function solution() {
  // Write your solution here
}

console.log(solution());`,

  typescript: `// TypeScript
function solution(): void {
  // Write your solution here
}

solution();`,

  python: `# Python
def solution():
    # Write your solution here
    pass

if __name__ == "__main__":
    print(solution())`,

  java: `// Java
public class Solution {
  public static void main(String[] args) {
    // Write your solution here
  }
}`,

  cpp: `// C++
#include <bits/stdc++.h>
using namespace std;

int main() {
  // Write your solution here
  return 0;
}`,

  c: `// C
#include <stdio.h>

int main() {
  // Write your solution here
  return 0;
}`,

  go: `// Go
package main

import "fmt"

func main() {
  // Write your solution here
  fmt.Println("Hello")
}`,

  rust: `// Rust
fn main() {
  // Write your solution here
  println!("Hello");
}`,

  ruby: `# Ruby
def solution
  # Write your solution here
end

puts solution`,

  kotlin: `// Kotlin
fun main() {
  // Write your solution here
}`,
};

/* -------------------------------------------------------------------------- */
/*                               Editor Services                               */
/* -------------------------------------------------------------------------- */

/**
 * Returns all available language templates.
 */
export const getEditorTemplatesService = () => {
  const templates = Object.entries(CODE_TEMPLATES).map(([language, code]) => ({
    language,
    code,
  }));
  return { templates };
};

/**
 * Fetches editor state for a session.
 * Populates the match request (including description) for session room context.
 */
export const getEditorSessionService = async (sessionId: string, userId: string) => {
  const session = await InterviewSessionModel.findById(sessionId)
    .populate("matchId", "interviewType preferredRole difficulty preferredLanguage duration description");

  if (!session) throw new AppError("Session not found.", 404);

  if (
    session.interviewerId.toString() !== userId &&
    session.intervieweeId.toString() !== userId
  ) {
    throw new AppError("You are not a participant of this session.", 403);
  }

  return {
    sessionId: session._id,
    roomId: session.roomId,
    status: session.status,
    code: session.code ?? null,
    language: session.language ?? null,
    match: session.matchId,
  };
};

/**
 * Persists editor code + language into the session document.
 */
export const saveEditorSessionService = async (
  sessionId: string,
  userId: string,
  code: string,
  language: string
) => {
  const session = await InterviewSessionModel.findById(sessionId);
  if (!session) throw new AppError("Session not found.", 404);

  if (
    session.interviewerId.toString() !== userId &&
    session.intervieweeId.toString() !== userId
  ) {
    throw new AppError("You are not a participant of this session.", 403);
  }

  const updated = await InterviewSessionModel.findByIdAndUpdate(
    sessionId,
    { $set: { code, language } },
    { new: true }
  );

  return {
    sessionId: updated!._id,
    code: updated!.code,
    language: updated!.language,
  };
};

/**
 * Code execution placeholder.
 * A real execution engine (e.g. Judge0) would be integrated here.
 */
export const runEditorSessionService = async (
  sessionId: string,
  userId: string,
  _code: string,
  _language: string,
  _input?: string
) => {
  const session = await InterviewSessionModel.findById(sessionId);
  if (!session) throw new AppError("Session not found.", 404);

  if (
    session.interviewerId.toString() !== userId &&
    session.intervieweeId.toString() !== userId
  ) {
    throw new AppError("You are not a participant of this session.", 403);
  }

  // Code execution engine not yet integrated.
  throw new AppError("Code execution is not yet available.", 501);
};

/**
 * Resets editor code + language to null (clean slate / back to template).
 */
export const resetEditorSessionService = async (sessionId: string, userId: string) => {
  const session = await InterviewSessionModel.findById(sessionId);
  if (!session) throw new AppError("Session not found.", 404);

  if (
    session.interviewerId.toString() !== userId &&
    session.intervieweeId.toString() !== userId
  ) {
    throw new AppError("You are not a participant of this session.", 403);
  }

  await InterviewSessionModel.findByIdAndUpdate(
    sessionId,
    { $unset: { code: "", language: "" } },
    { new: true }
  );

  return { reset: true };
};
