import logo from 'lib/assets/logo.svg';
import { useNearContext } from 'lib/utils/nearweb3';
import { Fragment, useEffect, useCallback, useState } from 'react';
import Wallet from '../wallet/wallet';
import Link from 'next/link';

export function Header() {
  const {login, logout, walletConnection, initialize, getBalance, getAccountId } = useNearContext();
  const [balance, setBalance] = useState(null);
  const [accountId, setAccountId] = useState("");

  const initDApp = useCallback( async () => {
    await initialize()
  }, []);

  const getAccount = useCallback( async () => { 
    if(walletConnection !== null) {
      const account = await getAccountId();
      setAccountId(account);

      if(account){
        const balance = await getBalance();
        setBalance(balance)
      }
    }
  }, [walletConnection])

  function disconnect() {
    setAccountId("");
    logout();
  }

  useEffect( () => {
    if(walletConnection === null){
      initDApp();
    }
    getAccount();
}, [initDApp, walletConnection, getAccount])

  return (
    <div className="bg-gray-900 border-b border-gray-800 text-white text-sm font-mono">
      <div className="container py-4 md:flex items-center">
        <div className="flex-1 mb-3 md:mb-0">
          <a href="/">
            <img src={logo.src} className={"filter"} style={{ height: 22 }} />
            <h6>cArt Market</h6>
          </a>
        </div>
        <div className="flex space-x-6 items-center">
          {accountId ? (
            <Fragment>
              <Link href="/create">
                <a>Create</a>
              </Link>
              <Link href="/my-items">
                <a>My Items</a>
              </Link>
                <Wallet
										address={accountId}
										amount={balance}
										symbol="NEAR"
										destroy={disconnect}
									/>          
              </Fragment>
          ) : (
            <a onClick={login} className="border border-red-500 px-3 py-2">Connect Wallet</a>
          )}
        </div>
      </div>
    </div>
  )
}