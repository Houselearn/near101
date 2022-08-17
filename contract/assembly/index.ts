// import { item, itemsStorage } from './model';
import { context, ContractPromiseBatch, logging, u128 } from "near-sdk-as";

import { itemsStorage, Item, storageFee, getUserItems } from "./model";

/**
 * 
 * This function changes the state of data in the blockchain. 
 * It is used to issue buy transactions when a item is purchased from a given seller (if the item is available)
 * 
 * @param itemId - an identifier of a item that is the subject of purchase
 */
export function buyItem(itemId: string): void {
    const item = getItem(itemId);
    if (item == null) {
        throw new Error("item not found");
    }
    if (item.price.toString() != context.attachedDeposit.toString()) {
        throw new Error("attached deposit should be greater than the item's price");
    }
    /*
        `ContractPromiseBatch` is used here to create a transaction to transfer the money to the seller
        The amount of money to be used in the transaction is taken from `context.attachedDeposit` 
        which is defined by `--depositYocto=${AMOUNT}` parameter during the invocation 
    */
    item.buyListing()
    ContractPromiseBatch.create(item.owner).transfer(u128.sub(context.attachedDeposit, storageFee));
    itemsStorage.set(item.id, item);
}

/**
 * 
 * @param item - a item to be added to the blockchain
 */
export function addNewItem(item: Item): void {
    let storedItem = itemsStorage.get(item.id);
    if (storedItem !== null) {
        throw new Error(`a item with id=${item.id} already exists`);
    }

    const newItem = Item.NewItem(item);

    newItem.addListing();

    itemsStorage.set(item.id, newItem);

    logging.log(item.id);
}

/**
 * 
 * A function that relists an existing item on the item with a new price
 * 
 * @param itemId - an identifier of a item to be listed
 * @param newPrice - new price of item
 */
export function relistItem(itemId: string, newPrice: u128): void {
    const item = getItem(itemId);
    if (item == null) {
        throw new Error("item not found");
    }
    if (item.owner != context.predecessor) {
        throw new Error("Only item owner can list item")
    }
    if (item.isItemListed) {
        throw new Error("Item is already listed")
    }

    item.updateListing(newPrice);
    itemsStorage.set(item.id, item);
}

/**
 * 
 * A function that unlists an item from the market
 * 
 * @param itemId - an identifier of a item to be unlisted
 */
export function unlistItem(itemId: string): void {
    const item = getItem(itemId);
    if (item == null) {
        throw new Error("item not found");
    }
    if (item.owner != context.predecessor) {
        throw new Error("Only item owner can unlist item")
    }
    if (!item.isItemListed) {
        throw new Error("Item is not listed")
    }

    item.removeListing()
    itemsStorage.set(item.id, item);
}

/**
 * 
 * A function that returns an array of items Ids owned by a user
 * 
 * @returns an array 
 */
export function userItems(accountId: string): Array<String> {
    const userItems = getUserItems(accountId)

    return userItems.items;
}

/**
 * 
 * A function that returns a single item for given owner and item id
 * 
 * @param id - an identifier of a item to be returned
 * @returns a item for a given @param id
 */
export function getItem(id: string): Item | null {
    return itemsStorage.get(id);
}

/**
 * 
 * A function that returns an array of items for all accounts
 * 
 * @returns an array of objects that represent a item
 */
export function getItems(): Array<Item> {
    return itemsStorage.values();
}
