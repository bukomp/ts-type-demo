// **************************************************************************
// **************************************************************************
//* Conditional Types

/*
?  Explanation:
?  IsArray is a type-level check, not a runtime function.
?  It helps us determine at compile-time whether a type is an array.
?  ExtractArray is used to infer the element type of an array.
?  Both are useful for creating more flexible and type-safe generic functions and types.
*/

//? '''''''''''''''''''' THEORY ''''''''''''''''''''''

type IsArray<T> = T extends any[] ? true : false;

type NumberArrayCheck = IsArray<number[]>; // true
type StringCheck = IsArray<string>; // false
type ObjectArrayCheck = IsArray<{ name: string }[]>; // true

console.log('Is number[] an array?', true as NumberArrayCheck);
console.log('Is string an array?', false as StringCheck);
console.log('Is {name: string}[] an array?', true as ObjectArrayCheck);

type ExtractArray<T> = T extends (infer U)[] ? U : never;

type StringArrayElement = ExtractArray<string[]>; // string
type NumberArrayElement = ExtractArray<number[]>; // number
type ObjectArrayElement = ExtractArray<{ id: number; name: string }[]>; // {id: number, name: string}
type NeverElement = ExtractArray<string>; // never (undefined)

//? '''''''''''''''''''' USAGE ''''''''''''''''''''''

const numbers: number[] = [1, 2, 3];
const extractedNumber: ExtractArray<typeof numbers> = 4; // Valid

const returnArrayFirstElementOrNever = <T>(arg: T): ExtractArray<T> => {
  if (arg instanceof Array) {
    return arg[0];
  }
  return void 0 as never;
};

returnArrayFirstElementOrNever(['dawawd', 'awdibwa']);
returnArrayFirstElementOrNever(2);

// **************************************************************************
// **************************************************************************
//* Mapped Types

/*
?  Explanation:
?  Mapped types allow us to transform each property in a type.
?  The Readonly<T> type makes all properties of T read-only.
?  This is useful for creating immutable versions of existing types.
?  It helps prevent accidental modifications to object properties.
*/

//? '''''''''''''''''''' THEORY ''''''''''''''''''''''

type ReadonlyMappedTypes<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : ReadonlyMappedTypes<T[P]>
    : T[P];
};

interface Mutable {
  a: number;
  b: string;
}

type ReadonlyVersion = ReadonlyMappedTypes<Mutable>;
// { readonly a: number; readonly b: string; }

//? '''''''''''''''''''' USAGE ''''''''''''''''''''''

const mutableObject: Mutable = { a: 1, b: 'hello' };
const readonlyObject: ReadonlyVersion = { a: 2, b: 'world' };

// This is allowed
mutableObject.a = 3;

//! This would cause a TypeScript error
// @ts-ignore
readonlyObject.a = 4;

const add = <T extends { a: number }>(obj: ReadonlyMappedTypes<T>): T => {
  // Create a mutable copy of the object and modify if 'a' exists
  const objCopy = { ...obj } as T;
  objCopy.a = 2;
  return objCopy;
};

const result = add(mutableObject);

// Create a new object with the 'c' property
const mutableObjectWithoutA = { b: 2, c: 3 };

//! This will cause a TypeScript error
// @ts-ignore
add(mutableObjectWithoutA);

// The Widen<T> type is a utility type that removes readonly modifiers and widens literal types.
// It works recursively on nested objects.

type Widen<T> = T extends object
  ? { -readonly [K in keyof T]: Widen<T[K]> } // For objects: remove readonly and recurse
  : T;

// Usage example:
const x = { a: 1, b: 'hello' as const } as const;
type WidenedX = Widen<typeof x>;
// Result: { a: number; b: string; }

// **************************************************************************
// **************************************************************************
//* Type Guards

/*
?  Explanation:
?  Type guards are functions that perform a runtime check to narrow down the type of a value.
?  They help TypeScript understand the type of a value within a specific code block.
?  This allows for safer type assertions and more precise type checking.
*/

//? '''''''''''''''''''' THEORY ''''''''''''''''''''''

const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

//? '''''''''''''''''''' USAGE ''''''''''''''''''''''

const processValue = (value: unknown) => {
  if (isString(value)) {
    console.log(value.toUpperCase());
  } else {
    console.log('Not a string');
  }
};

processValue('hello'); // Outputs: HELLO
processValue(42); // Outputs: Not a string

// **************************************************************************
// **************************************************************************
//* Advanced Typing Techniques

/*
?  Explanation:
?  These techniques allow for more precise type definitions. Intersection types combine multiple types,
?  union types allow a value to be one of several types, literal types specify exact values,
?  and template literal types create string literal types based on string interpolation.
*/

//? '''''''''''''''''''' THEORY ''''''''''''''''''''''

// Intersection Types
type Combined = { a: number } & { b: string };

// Union Types
type Result = number | string | boolean;

// Literal Types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

// The difference:
// Union Types:
// - Can combine multiple types or values
// - Allow for a wider range of possibilities
// - Example: Result can be any number, any string, or any boolean

// Literal Types:
// - Specify exact values
// - Restrict to a finite set of options
// - Example: DiceRoll can only be one of six specific numbers

// In practice:
let resultExample: Result = 42; // Valid
let methodExample: HttpMethod = 'GET'; // Valid
// @ts-ignore
let diceExample: DiceRoll = 7; // Error: Type '7' is not assignable to type 'DiceRoll'

// Template Literal Types
type Endpoint = `/api/${string}`;
type ApiCall = `${HttpMethod} ${Endpoint}`;

//? '''''''''''''''''''' USAGE ''''''''''''''''''''''

const combinedObject: Combined = { a: 1, b: 'hello' };

type Status = 'success' | 'error' | 'pending';

const checkStatus = (status: Status) => {
  switch (status) {
    case 'success':
      console.log('Operation successful');
      break;
    case 'error':
      console.log('An error occurred');
      break;
    case 'pending':
      console.log('Operation in progress');
      break;
  }
};

const makeApiCall = (call: ApiCall) => {
  console.log(`Making API call: ${call}`);
};

makeApiCall('GET /api/users');
makeApiCall('POST /api/products');

// **************************************************************************
// **************************************************************************
//* Utility Types

/*
?  Explanation:
?  Utility types are built-in types in TypeScript that facilitate common type transformations.
?  Partial makes all properties optional, Pick creates a type with only the specified properties,
?  Omit creates a type without the specified properties, and Record creates an object type with
?  specified key and value types.
*/

//? '''''''''''''''''''' THEORY ''''''''''''''''''''''

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

// Partial
type PartialUser = Partial<User>;

// Pick
type NameAndAge = Pick<User, 'name' | 'age'>;

// Omit
type UserWithoutId = Omit<User, 'id'>;

// Record
type UserRoles = Record<string, User>;

//? '''''''''''''''''''' USAGE ''''''''''''''''''''''

const updateUser = (user: User, fieldsToUpdate: PartialUser): User => {
  return { ...user, ...fieldsToUpdate };
};

const displayNameAndAge = (user: NameAndAge) => {
  console.log(`Name: ${user.name}, Age: ${user.age}`);
};

const createUserWithoutId = (user: UserWithoutId): User => {
  return { ...user, id: Math.random() };
};

const userRoles: UserRoles = {
  admin: { id: 1, name: 'Admin', age: 30, email: 'admin@example.com' },
  user: { id: 2, name: 'User', age: 25, email: 'user@example.com' },
};

// Example usage
const user: User = { id: 1, name: 'John', age: 30, email: 'john@example.com' };
const updatedUser = updateUser(user, { age: 31 });
displayNameAndAge(updatedUser);
const newUser = createUserWithoutId({
  name: 'Jane',
  age: 28,
  email: 'jane@example.com',
});
console.log(userRoles.admin);

// **************************************************************************
// **************************************************************************
//* Best Practices

/*
?  Explanation:
?  These examples demonstrate best practices in TypeScript.
?  Using 'unknown' instead of 'any' provides better type safety.
?  Const assertions preserve literal types.
?  Avoiding type assertions and using type guards instead leads to safer code.
*/

//? '''''''''''''''''''' USAGE ''''''''''''''''''''''

// Use 'unknown' instead of 'any'
//? '''''''''''''''''''' THEORY ''''''''''''''''''''''
// Why use 'unknown' instead of 'any'?
// Enhanced Type Safety: Requires explicit type checks, preventing runtime errors.

//? '''''''''''''''''''' USAGE ''''''''''''''''''''''
const processData = (data: unknown): void => {
  //! This is not allowed
  // @ts-ignore
  data.toUpperCase();

  // This is allowed
  if (typeof data === 'string') {
    data.toUpperCase();
  } else if (typeof data === 'number') {
    data.toFixed(2);
  } else {
    ('Unsupported data type');
  }
};

// Const assertions for literal types
//? '''''''''''''''''''' THEORY ''''''''''''''''''''''
// Const assertions preserve literal types and make objects readonly

//? '''''''''''''''''''' USAGE ''''''''''''''''''''''
const config = {
  endpoint: '/api/users',
  method: 'GET',
  object: {
    id: 1,
    name: 'John',
  },
} as const;

// Name is now constant 'John'
config.object.name;

//! This will cause a TypeScript error
// @ts-ignore
config.object.name = 'Jane';

type Config = typeof config;
type ConfigKey = keyof typeof config;

// Config is now {
//   readonly endpoint: "/api/users";
//   readonly method: "GET";
//   readonly object: {
//     readonly id: 1;
//     readonly name: "John";
//   }
// }

// Avoid type assertions when possible
//? '''''''''''''''''''' THEORY ''''''''''''''''''''''
// Use type guards and instanceof checks for safer type narrowing

//? '''''''''''''''''''' USAGE ''''''''''''''''''''''
const canvas = document.getElementById('main_canvas');
if (canvas instanceof HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
  }
}

// Example usage of processData
processData('hello world');
processData(42);
processData({ name: 'John' });

// Using the config object
function makeRequest(config: Config) {
  console.log(`Making ${config.method} request to ${config.endpoint}`);
}

makeRequest(config);

// Subsection: Chaining Generic Functions
//? '''''''''''''''''''' THEORY ''''''''''''''''''''''
// This subsection demonstrates how to chain generic functions
// and use the ReturnType utility type to ensure type safety.

//? '''''''''''''''''''' USAGE ''''''''''''''''''''''
const data = {
  a: 1,
};

const addBfromA = <T extends { a: number }>(obj: T) => ({
  ...obj,
  b: obj.a + 'Hello',
});

const addCfromB = <T extends ReturnType<typeof addBfromA>>(obj: T) => ({
  ...obj,
  c: obj.b + 'World',
});

const addDfromA = <T extends ReturnType<typeof addBfromA>>(obj: T) => ({
  ...obj,
  d: obj.a + '!',
});

const response1 = addBfromA(data);
const response2 = addCfromB(response1);
const response3 = addDfromA(response2);

console.log(response3);
