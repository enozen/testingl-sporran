import { ApiPromise, WsProvider } from "@polkadot/api";
import { u64 } from '@polkadot/types';


  //This are the public keys of the two Address used here:  (Just 2 dummy addresses)
  const account1peregrine = '4pHTyxtzRsKnj357d7ZefZ5B8js3UY8ko6eKBFo5Z179Tn82'; //a.k.a.: existentialDeposit_1
  const account2peregrine = '4pZ7BCRMBJVao9y9ixUAtnxABhu95Up3vpypzgmXErkpwTTg'; //a.k.a.: existentialDeposit_2

export function usePolkadotApi(wsEndpoint: string): Promise<ApiPromise>{
    const provider = new WsProvider(wsEndpoint);
    return ApiPromise.create({provider}); //KIlTs use 15 decimal places
  
}

export async function holdExitentialDeposit(wsEndpoint: string): Promise<number> {

    const api = await usePolkadotApi(wsEndpoint);
    const helpVariable = (api.consts.balances.existentialDeposit as u64).toNumber();
    const existentialDeposit = helpVariable/(10**15);
    api.disconnect();
    return existentialDeposit;
  }

export async function numberOfDecimalPlaces(wsEndpoint: string): Promise<number>  {
  const api = await usePolkadotApi(wsEndpoint);
  const chainInfo = api.registry.getChainProperties();


  //thinking-work process: 
  // const olddecimalplaces = chainInfo?.tokenDecimals;
  // console.log("the number of decimals that Kilt use is: " + olddecimalplaces);
  // const helperString = olddecimalplaces?.toString();
  // console.log("aqui es que estamos " +helperString);
  // const decimales = helperString?.slice(1,3);
  // console.log("did it worked? " + decimales + "\n \n")
  // const forreal = parseInt(decimales, 10);

  // @ts-ignore :: typscript is afraid of undefines
  const decimalplaces = parseInt(chainInfo?.tokenDecimals.toString().slice(1,3), 10);
  //console.log("the number of decimals that Kilt use is: " + decimalplaces);
  
  return decimalplaces;
}


 export  async function chainFee(wsEndpoint: string): Promise<number>  {


    const api = await usePolkadotApi(wsEndpoint);
    const info = await api.tx.balances
    .transfer(account2peregrine, 123)
    .paymentInfo(account1peregrine);

    const decimalplaces: number = await numberOfDecimalPlaces(wsEndpoint);

    const transactionFee = parseInt(info.partialFee.toHex(), 16)/10**decimalplaces; // divided by 10^15 to express it in Kilts
    return transactionFee;
  }

  export async function getTotalBalance(wsEndpoint: string, address: string | null): Promise<number> { 
    if(!address){
      console.error("the address cannot be null for this function to really do something")
    }

    const api = await usePolkadotApi(wsEndpoint);
    const decimalplaces: number = await numberOfDecimalPlaces(wsEndpoint);
    
    // const accountInfo = await api.query.system.account(address);
    // console.log(accountInfo.toHuman());

    //@ts-ignore
    let { data: { free: freeBalance, reserved: reservedBalance } } = await api.query.system.account(address);

    // console.log("here is the free balance ", freeBalance.toHuman());
    // console.log("here is the reserved balance ", reservedBalance.toHuman());

    const totalbalanceLong: number = (parseInt(freeBalance.toHex(), 16)+ parseInt(reservedBalance.toHex(), 16))/10**decimalplaces;
    

    return totalbalanceLong;


  }

  // export async function getTransferableBalance(wsEndpoint: string, address: string | null): Promise<number> { 
  //   if(!address){
  //     console.error("the address cannot be null for this function to really do something")
  //   }

  //   const api = await usePolkadotApi(wsEndpoint);
  //   const decimalplaces: number = await numberOfDecimalPlaces(wsEndpoint);

  //   // const accountInfo = await api.query.system.account(address);
  //   // console.log(accountInfo.toHuman());

  //   //@ts-ignore
  //   let { data: { free: freeBalance, miscFrozen: lockedBalance} } = await api.query.system.account(address);

  //   const transferableBalance: number  =   (parseInt(freeBalance.toHex(), 16) - parseInt(lockedBalance.toHex(), 16))/10**decimalplaces;
  //   return transferableBalance;
  // } 

  export async function getTransferableBalance(wsEndpoint: string, address: string | null): Promise<number> { 
    if(!address){
        console.error("The address cannot be null for this function to really do something");
        return 0; 
    }

    const api = await usePolkadotApi(wsEndpoint);
    const decimalplaces: number = await numberOfDecimalPlaces(wsEndpoint);

    //@ts-ignore
    let { data: { free: freeBalance, miscFrozen: lockedBalance} } = await api.query.system.account(address);

    // check of existence lockedBalance
    if (!lockedBalance) {
        lockedBalance = { toHex: () => '0x0' }; // if lockedBalance not definde
    }

    const transferableBalance = (parseInt(freeBalance.toHex(), 16) - parseInt(lockedBalance.toHex(), 16)) / 10**decimalplaces;
    return transferableBalance;
}


  // export async function getLockedBalance(wsEndpoint: string, address: string | null): Promise<number> { 
  //   if(!address){
  //     console.error("the address cannot be null for this function to really do something")
  //   }

  //   const api = await usePolkadotApi(wsEndpoint);
  //   const decimalplaces: number = await numberOfDecimalPlaces(wsEndpoint);

  //   // const accountInfo = await api.query.system.account(address);
  //   // console.log(accountInfo.toHuman());

  //   //@ts-ignore
  //   let { data: { miscFrozen: lockedBalance} } = await api.query.system.account(address);

  //   const lockedBalanceDecimal: number  =   (parseInt(lockedBalance.toHex(), 16))/10**decimalplaces;
  //   return lockedBalanceDecimal;
  // } 

  export async function getLockedBalance(wsEndpoint: string, address: string | null): Promise<number> { 
    if(!address){
        console.error("The address cannot be null for this function to really do something");
        return 0; 
    }

    const api = await usePolkadotApi(wsEndpoint);
    const decimalplaces: number = await numberOfDecimalPlaces(wsEndpoint);

    //@ts-ignore
    let { data: { miscFrozen: lockedBalance} } = await api.query.system.account(address);

    // lockedBalance check
    if (!lockedBalance) {
        lockedBalance = { toHex: () => '0x0' }; // if lockedBalance not defined 
    }

    const lockedBalanceDecimal = parseInt(lockedBalance.toHex(), 16) / 10**decimalplaces;
    return lockedBalanceDecimal;
}


  export async function getBondedBalance(wsEndpoint: string, address: string | null): Promise<number> { 
    if(!address){
      console.error("the address cannot be null for this function to really do something")
    }

    const api = await usePolkadotApi(wsEndpoint);
    const decimalplaces: number = await numberOfDecimalPlaces(wsEndpoint);

    // const accountInfo = await api.query.system.account(address);
    // console.log(accountInfo.toHuman());

    //@ts-ignore
    let { data: { reserved: lockedBalance} } = await api.query.system.account(address);

    const bondedBalanceDecimal: number  =   (parseInt(lockedBalance.toHex(), 16))/10**decimalplaces;
    return bondedBalanceDecimal;
  }