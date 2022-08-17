import { Button, Layout, Loader } from "components";
import { getItem } from "lib/utils/market";
import TimeAgo from "react-timeago";
import { ExternalLink } from "react-feather";
import { useNearContext } from "lib/utils/nearweb3";
import { unlistItem, buyItem } from "lib/utils/market";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { Item } from "lib/interfaces";
import { utils } from "near-api-js";
import {typeformat} from "lib/typeFormat";
import ListItemModal from "./listModal";

function Details({id}: {id: string}) {

  const template: Item = {
    id: "...",
    owner: "...",
    name: "...",
    description: "...",
    image: "...",
    location: "...",
    price: "0",
    isItemListed: true,
    history:[]
  }

  const { accountId, login, contract } = useNearContext();
  const [item, setItem] = useState<Item>(template);
  const [loading, setLoading] = useState(false);
  const [pageLoad, setPageLoad] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);

  const getItemData = useCallback(async () => {
    if(contract !== null || accountId !== null || id !== null){
      try {
        setPageLoad(true);
        setItem(await getItem(id, contract));
      } catch (error) {
        console.log({ error });
      } finally {
        setPageLoad(false);
      }
    }
  }, [contract, accountId, id]);

  const buttonLabel = accountId ? (item.owner === accountId ?  (item.isItemListed? 'Remove listing' : 'Add listing') : 'Buy now') : 'Connect Wallet';
  
  async function handleAction() {
    if(contract === null)  {
      return
    }
    if (!accountId) {
      await login();
      return;
    }
    setLoading(true);
    try {
      if (item.owner === accountId) {
        if(buttonLabel == "Add listing"){
          setShowModal(true);
        }else if(buttonLabel == "Remove listing"){
          await unlistItem(item.id, contract);
          getItemData();
        }
      } else {
        await buyItem({itemId: item.id, price: item.price}, contract);
        getItemData();
      }
    } catch(e) {}
    setLoading(false);
  }

  useEffect( () => {
    if(id === null){
        return () => {}
    }
    getItemData();
  }, [id, getItemData])
  return (
    <Layout>
      {pageLoad? (
        <Loader />  
      ) : (
        <div className="container py-8">
        <div className="md:grid md:grid-cols-3 md:gap-8">
          <div className="mb-8 md:mb-0">
            <div className="bg-gray-800 border border-gray-800 mb-8">
              <img src={item.image} className="w-full rounded-sm shadow-xl" />
            </div>
            {Number(utils.format.formatNearAmount(item.price)) > 0 && (
              <Fragment>
                <div className="bg-gray-800 border border-gray-700 rounded-sm grid grid-cols-2 divide-x divide-gray-700">
                  <div className="p-4 text-center">
                    <p className="uppercase font-bold text-sm mb-1 text-red-600">
                      Item Price
                    </p>
                    <p className="font-mono text-xl leading-none">
                      {utils.format.formatNearAmount(item.price)} NEAR
                    </p>
                  </div>
                  <div className="p-3 flex flex-col justify-center items-center">
                    <Button onClick={handleAction} loading={loading} block>{buttonLabel}</Button>
                  </div>
                </div>
              </Fragment>
            )}
          </div>
          <div className="md:col-span-2">
            <div className="bg-gray-800s lg:border-l border-gray-700 border-dashesd lg:pl-8 rounded-sm">
              <p className="text-lg font-medium">
                  <a>{item.name}</a>
              </p>
              <h1 className="text-4xl font-bold">{item.name}</h1>
              <p className="mb-8 w-full">
                <span className="mr-1">Owned by</span>
                <a
                  href={`https://testnet.nearblocks.io/address/${item.owner}#transaction`}
                  target="_blank"
                  className="font-mono text-red-200 border-b border-dashed border-gray-700 truncate block">
                  {item.owner}
                </a>
              </p>
              <h3 className="mb-3 font-semibold text-lg">Details</h3>
              <div className="mb-8 bg-gray-900 p-4 rounded-sm space-y-4">
                <div>
                  <span className="font-bold text-sm block">Description</span>
                  {item.description}
                </div>
                <div>
                  <span className="font-bold text-sm block">Location</span>
                    {item.location}
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <span className="font-bold text-sm block">Item ID</span>
                    {item.id}
                  </div>
                </div>
              </div>
              <h3 className="mb-3 font-semibold text-lg">History</h3>
              <div className="bg-gray-900 rounded-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <td className="px-4 py-3">Type</td>
                      <td className="px-4 py-3">From</td>
                      <td className="text-right px-4 py-3">Price</td>
                      <td className="text-right px-4 py-3">Time</td>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {item.history.reverse()?.map(transaction=> (
                      <tr key={transaction.id}>
                        <td className="border-t border-gray-800 px-4 py-3">
                          <span className="flex items-center space-x-1" style={{"color": "#D7342A"}}>
                            <span>{typeformat(Number(transaction.type))}</span>
                            <ExternalLink size="0.85em" />
                          </span>
                        </td>
                        <td className="relative w-1/4 border-t border-gray-800">
                          <span className="absolute inset-0 truncate px-4 py-3">
                            {transaction.from}
                          </span>
                        </td>
                        <td className="relative w-1/4 border-t border-gray-800 px-4 py-3 text-right">
                          {Number(transaction.price) ? `${utils.format.formatNearAmount(transaction.price)} NEAR` : '--'}
                        </td>
                        <td className="text-right border-t border-gray-800 px-4 py-3">
                          <TimeAgo date={new Date(transaction.createdAt / 1000000)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {showModal? (
        <ListItemModal handleClose={handleClose} update={getItemData} contract={contract} id={item.id}/>
      ) : 
        <></>
      }
      
    </Layout>
  )
}

export default Details;