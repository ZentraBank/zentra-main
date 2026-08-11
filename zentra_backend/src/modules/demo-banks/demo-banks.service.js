const BANKS = [
  { code: "CHASE", name: "JPMorgan Chase", country: "US", currencies: ["USD"] },
  { code: "BOA", name: "Bank of America", country: "US", currencies: ["USD"] },
  { code: "WELLS", name: "Wells Fargo", country: "US", currencies: ["USD"] },
  { code: "CITI", name: "Citibank", country: "US", currencies: ["USD","GBP"] },
  { code: "HSBC", name: "HSBC", country: "GB", currencies: ["GBP","USD"] },
  { code: "BARCLAYS", name: "Barclays", country: "GB", currencies: ["GBP"] },
  { code: "MONZO", name: "Monzo", country: "GB", currencies: ["GBP"] },
  { code: "GTB", name: "Guaranty Trust Bank", country: "NG", currencies: ["NGN"] },
  { code: "ZENITH", name: "Zenith Bank", country: "NG", currencies: ["NGN"] },
  { code: "ACCESS", name: "Access Bank", country: "NG", currencies: ["NGN"] }
];
const httpError=(statusCode,message)=>Object.assign(new Error(message),{statusCode});
const list=()=>BANKS;
const resolve=({bankCode,accountNumber})=>{
  const bank=BANKS.find((item)=>item.code===bankCode);
  if(!bank) throw httpError(404,"Demo bank not found");
  if(!/^\d{8,20}$/.test(accountNumber)) throw httpError(400,"Enter a valid account number");
  const suffix=accountNumber.slice(-4);
  return { bankCode:bank.code, bankName:bank.name, accountNumber, accountName:`Demo Account ${suffix}`, currency:bank.currencies[0], isSimulated:true };
};
module.exports={list,resolve};
