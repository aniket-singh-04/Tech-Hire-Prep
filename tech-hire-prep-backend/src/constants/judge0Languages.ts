export const JUDGE0_LANGUAGES: Record<string, number> = {

  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  go: 60,
  rust: 73,
  ruby: 72,
  kotlin: 78,
};

export const CODE_TEMPLATES: Record<string, string> = {
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