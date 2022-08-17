import React, {useCallback, useEffect, useState} from "react";
import { Layout, Loader } from "components";
import { ItemList } from "components/item-list/item-list";
import { Item } from "lib/interfaces";
import { getItems } from "../lib/utils/market";
import {useNearContext} from "../lib/utils/nearweb3";

function Index() {
  const {accountId, contract} = useNearContext();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  // function to get the list of items
  const retrieveItems = useCallback(async () => {
      if(contract === null){
        return
      }
      try {
        setLoading(true);
        let listedItems: Item[] = []
        const items: Item[] = await getItems(contract);
        for (let i = 0; i < items.length; i++){
          if (!items[i].isItemListed){
            continue; 
          }
          listedItems.push(items[i])
        }
        setItems(listedItems);
      } catch (error) {
        console.log({ error });
      } finally {
        setLoading(false);
      }
  }, [contract]);

  useEffect( () => {
    if(accountId !== null){
      retrieveItems();
    }
  }, [retrieveItems, accountId])

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="font-semibold text-xl mb-5">Listed Items</h1>
        {loading && <Loader />}
        <ItemList items={items} />
      </div>
    </Layout>
  )
}

export default Index;