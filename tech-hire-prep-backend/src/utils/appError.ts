export class AppError extends Error {
    public readonly statusCode: number;  // this ma statusCode as the public variable 
    public readonly isOperational: boolean;
    public readonly details?: unknown;

    constructor(message: string, statusCode: number, details?: unknown) {
        super(message); // This calls the constructor of the base Error class. It sets the standard error message.internally look like this ex > throw new Error("User not found");
        // then 
        // The Error class sets:
        //     this.message = "User not found";
        //     this.name = "Error";

        this.statusCode = statusCode;
        this.isOperational = true;
        this.details = details;

        // then 
        // Control comes back to your AppError constructor
        //     Then this runs:
        //     this.statusCode = 404;
        //     this.isOperational = true;

        // final object look like 
        //     {
        //   message: "User not found",
        //   name: "Error",
        //   statusCode: 404,
        //   isOperational: true,
        //   stack: "..."
        // }

        Error.captureStackTrace(this, this.constructor);
        // this = the error object being created by appError
        // captureStackTrace = "record how we reached here at the error"
        // this.constructor = "don’t include this constructor in the record" means do not mention the place of custom error where it was writen means place of appError file or (is used only to remove AppError constructor from stack trace)


        // When an error happens, JavaScript records:
        // 👉 “How did we reach this line ?”

        // Example stack:
        //     Error: User not found
        //     at getUser(app.ts: 10)
        //     at controller(controller.ts: 5)
        //     at server(server.ts: 2)


        // internally v8 engine put this.stack = generatedStackString;(this is the error ex above)

        // without above line 
        // AppError: User not found
        // at new AppError (AppError.ts:3) // this is the line number where super(message) call
        // at getUser (App.ts:7)
        // at Object.<anonymous> (App.ts:10)

        // with above line 
        // AppError: User not found
        // at getUser (App.ts:7)
        // at Object.<anonymous> (App.ts:10)
    }
}