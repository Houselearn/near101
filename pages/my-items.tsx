import React, { useState, useCallback, useEffect } from "react";
import { Layout, Loader } from "components";
import { ItemList } from "components/item-list/item-list";
import { getUserItems, getItem } from "lib/utils/market";
import { useNearContext } from "lib/utils/nearweb3";
import { Item } from "lib/interfaces";

function MyListings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const { accountId, contract } = useNearContext();

    // function to get the list of items
  const retrieveItems = useCallback(async () => {
      if(contract === null){
        return
      }
      try {
        setLoading(true);
        const userItemsIds = await getUserItems(accountId ,contract);
        const userItemsArr: Item[] = [];
        for (let i = 0; i < userItemsIds.length; i++ ){
          const item = await getItem(userItemsIds[i], contract);
          userItemsArr.push(item);
        }
        setItems(userItemsArr);
      } catch (error) {
        console.log({ error });
      } finally {
        setLoading(false);
      }
  }, [contract]);

  useEffect(() => {
    if(accountId !== null){
      retrieveItems();
    }
  }, [retrieveItems, accountId])

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="font-semibold text-xl mb-5">My Items</h1>
        {loading && <Loader />}
        <ItemList items={items} />
      </div>
    </Layout>
  )
}

export default MyListings;