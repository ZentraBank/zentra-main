import { apiRequest } from "@/lib/api-client";
export type TransactionPinStatus={isSet:boolean;isLocked:boolean};
export const transactionPinService={status:()=>apiRequest<TransactionPinStatus>("/transaction-pin/status"),setup:(input:{password:string;pin:string})=>apiRequest<TransactionPinStatus>("/transaction-pin/setup",{method:"POST",body:JSON.stringify(input)}),change:(input:{currentPin:string;newPin:string})=>apiRequest<TransactionPinStatus>("/transaction-pin/change",{method:"POST",body:JSON.stringify(input)})};
