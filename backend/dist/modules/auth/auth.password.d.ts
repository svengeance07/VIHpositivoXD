export declare function hashPassword(plainPassword: string): Promise<string>;
export declare function verifyPassword(hash: string | null | undefined, plainPassword: string): Promise<boolean>;
export declare function verifyDummyPassword(plainPassword: string): Promise<void>;
export declare function parseExpirationToSeconds(expr: string): number;
