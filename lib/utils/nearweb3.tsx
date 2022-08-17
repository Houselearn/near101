import { createContext, useContext, useState } from "react";
import environment from "./config";
import { connect, keyStores, Contract, WalletConnection } from "near-api-js";
import canUseDom from 'can-use-dom';
import { formatNearAmount } from "near-api-js/lib/utils/format";

const nearEnv = environment("testnet");
const NearContext = createContext<{walletConnection: WalletConnection, contract: Contract, accountId: string, initialize:() => Promise<void>, login: () => Promise<void>, logout: () => Promise<void>, getBalance: () => Promise<string>, getAccountId: () => Promise<string>}>(null);

function NearProvider({ children }) {
  const [walletConnection, setWalletConnection] = useState<WalletConnection>(null);
  const [contract, setContract] = useState<Contract>(null);
  const [accountId, setAccountId] = useState<string>(null);

  async function initialize() {
    try{
      const near =  await connect(
        Object.assign(
            { deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } },
            nearEnv
        )
      );

      let walletConnection: WalletConnection

      try{
        walletConnection = canUseDom && new WalletConnection(near, null);
      }catch(e){
        console.log(e)
        return
      }
      
      const contract = new Contract(
        walletConnection.account(),
        nearEnv.contractName,
        {
          // List here all view methods
          viewMethods: ["userItems", "getItem", "getItems"],
          // List call methods that change state
          changeMethods: ["buyItem", "addNewItem", "relistItem", "unlistItem"],
        }
      );
      setWalletConnection(walletConnection);
      setContract(contract);
      
    } catch (e) {
      console.log(e)
    }
  }

  async function getAccountId() {
    const account = walletConnection.getAccountId();
    setAccountId(account);
    return account;
  }

  async function getBalance() {
    const balance = formatNearAmount(
      (await walletConnection.account().getAccountBalance()).total,
      2
    );

    return balance;
  }

  async function handleLogin() {
    await walletConnection.requestSignIn(nearEnv.contractName);
  }

  async function handleLogout() {
    walletConnection.signOut();
    setAccountId(null);
  }

  return (
    <NearContext.Provider value={{ walletConnection, contract, accountId, initialize, login: handleLogin, logout: handleLogout, getAccountId, getBalance}}>
      {children}
    </NearContext.Provider>
  )
}

function useNearContext() {
  return useContext(NearContext)
}

export { NearContext, NearProvider, useNearContext, nearEnv};
