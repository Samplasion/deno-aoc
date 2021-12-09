function getStack() {
    // Save original Error.prepareStackTrace
    // @ts-expect-error: Error.prepareStackTrace is not a function
    const origPrepareStackTrace = Error.prepareStackTrace;
  
    // Override with function that just returns `stack`
    // @ts-expect-error: Define Error.prepareStackTrace as a function
    Error.prepareStackTrace = function (_, stack) {
      // deno-lint-ignore no-explicit-any
      return stack.map((s: any) => s.toString());
    }
  
    // Create a new `Error`, which automatically gets `stack`
    const err = new Error();
  
    // Evaluate `err.stack`, which calls our new `Error.prepareStackTrace`
    const stack = err.stack as unknown as string[];
  
    // Restore original `Error.prepareStackTrace`
    // @ts-expect-error: Restore Error.prepareStackTrace
    Error.prepareStackTrace = origPrepareStackTrace;
  
    // Remove superfluous function call on stack
    stack.shift() // getStack --> Error
  
    return stack;
}

export default function getCallerFile() {
    const stack = getStack();
    console.log(stack);
    const prefixRegex = Deno.build.os === "windows" ? /^file:\/\/\// : /^file:\/\//;
    const callerFile = stack[2].replace(/^\s+at\s+/, "").replace(prefixRegex, "").split(":")[0];
    return callerFile;
}