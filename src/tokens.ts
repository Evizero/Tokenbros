export const TOKEN_CAPACITY=1000;
export const RESET_RECOVERY=12;
export const shotCost=(cost:number)=>Math.ceil(cost-1e-9);
export function spendTokens(balance:number,cost:number):number|null {
  const amount=shotCost(cost);return balance>=amount?balance-amount:null;
}
