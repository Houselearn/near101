import { PersistentUnorderedMap, context, PersistentMap, u128 } from "near-sdk-as";

/**
 * This class represents a item that can be listed on a marketplace.
 * It contains basic properties that are needed to define a item.
 * The price of the item is of type u128 that allows storing it in yocto-NEAR, where `1 yocto = 1^-24`.
 * {@link nearBindgen} - it's a decorator that makes this class serializable so it can be persisted on the blockchain level. 
 */

enum tranType {
    ADD,
    REMOVE,
    BUY
}

@nearBindgen
class Transaction {
    id: number;
    type: tranType;
    from: string;
    price: u128;
    createdAt: u64;
}

@nearBindgen
export class Item {
    id: string;
    name: string;
    description: string;
    image: string;
    location: string;
    price: u128;
    owner: string;
    isItemListed: bool;
    history: Array<Transaction>;
    public static NewItem(payload: Item): Item {
        const item = new Item();
        item.id = payload.id;
        item.name = payload.name;
        item.description = payload.description;
        item.image = payload.image;
        item.location = payload.location;
        item.price = payload.price;
        item.owner = context.sender;
        item.isItemListed = true;
        item.history = new Array<Transaction>();
        return item;
    }

    public removeListing(): void {
        this.isItemListed = false;
        this.newHistory(tranType.REMOVE)
    }

    public addListing(): void {
        this.newHistory(tranType.ADD);

        //add to user items
        const userItems = getUserItems(this.owner);

        if (!userItems.checkItem(this.id)) {
            userItems.addItem(this.id)
        };

        updateUserItems(this.owner, userItems)
    }

    public updateListing(newPrice: u128): void {
        this.price = newPrice;
        this.isItemListed = true;
        this.addListing();
    }

    public buyListing(): void {
        // get seller items, remove item id and update
        const sellerItems = getUserItems(this.owner);
        sellerItems.removeItem(this.id);
        updateUserItems(this.owner, sellerItems)

        // get buyer items, add item id and update
        const buyerItems = getUserItems(context.predecessor);
        buyerItems.addItem(this.id);
        updateUserItems(context.predecessor, buyerItems)

        this.owner = context.predecessor
        this.isItemListed = false;

        this.newHistory(tranType.BUY)
    }

    private newHistory(TranType: tranType): void {
        var price: u128;
        if (TranType == tranType.REMOVE) {
            price = u128.from(0);
        } else {
            price = this.price;
        }

        const id = this.history.length;

        const newTransaction: Transaction = {
            id: id,
            type: TranType,
            from: context.sender,
            price: price,
            createdAt: context.blockTimestamp
        }

        this.history.push(newTransaction);
    }

}
export const itemsStorage = new PersistentUnorderedMap<string, Item>("LISTED_itemS");

export const storageFee: u128 = u128.from("1000000000000000000000000");

//User Item Section
@nearBindgen
export class OwnedItems {
    private _itemsArray: Array<string> = [];

    public removeItem(itemId: string): void {
        const index = this._itemsArray.indexOf(itemId);
        if (index < 0) {
            throw new Error(`${itemId} does not exist in user item list`)
        }
        this._itemsArray.splice(index, 1);
    }

    public checkItem(itemId: string): bool {
        return this._itemsArray.includes(itemId);
    }

    public addItem(itemId: string): void {
        this._itemsArray.push(itemId);
    }

    public get items(): Array<string> {
        return this._itemsArray
    }

    constructor(array: Array<string> = []) {
        this._itemsArray = array;
    }
}

const userItems = new PersistentUnorderedMap<string, OwnedItems>("user_items");

export function getUserItems(accountId: string): OwnedItems {
    const ownedItems = userItems.get(accountId);
    if (ownedItems === null) {
        return new OwnedItems()
    }
    return ownedItems;
}

function updateUserItems(accountId: string, ownedItems: OwnedItems): void {
    userItems.set(accountId, ownedItems);
}








/**
 * `itemsStorage` - it's a key-value datastructure that is used to store items by sellers.
 * The backbone of this datastructure is {@link PersistentUnorderedMap} - a facade in front of the NEAR's {@link Storage}.
 * For the sake of this contract we've chosen {@link PersistentUnorderedMap} as a storage for the next reasons:
 * - `set`, `get` and `delete` operations have a constant time complexity - O(1)
 * - keys are stored in the blockchain (which is opposite to {@link PersistentMap})
 * - provides an interface to return a range of values
 * 
 * Brakedown of the `PersistentUnorderedMap<string, item>` datastructure:
 * - the key of `PersistentUnorderedMap` is a `itemId`
 * - the value in this `PersistentUnorderedMap` is a item itself `item` that is related to a given key (`itemId`)
 */

