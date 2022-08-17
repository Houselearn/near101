import { v4 as uuid4 } from "uuid";
import { Item } from "lib/interfaces";
import { parseNearAmount } from "near-api-js/lib/utils/format";
import { Contract } from "near-api-js";

const GAS = 100000000000000;

export async function addNewItem(item: Item, contract: Contract) {
    item.id = uuid4();
    item.price = parseNearAmount(item.price + "");
    //@ts-ignore
    await contract.addNewItem({ item });
    return item.id;
}

export function relistItem(itemId: string, newPrice: string, contract: Contract) {
    newPrice = parseNearAmount(newPrice + "");
    //@ts-ignore
    return contract.relistItem({ itemId, newPrice });
}

export async function buyItem({ itemId, price }, contract: Contract) {
    //@ts-ignore
    await contract.buyItem({ itemId }, GAS, price);
}

export function unlistItem(itemId: string, contract: Contract) {
    //@ts-ignore
    return contract.unlistItem({ itemId });
}

export function getUserItems(accountId: string, contract: Contract) {
    //@ts-ignore
    return contract.userItems({ accountId });
}

export function getItem(itemId: string, contract: Contract) {
    const id = itemId
    //@ts-ignore
    return contract.getItem({ id })
}

export function getItems(contract: Contract) {
    //@ts-ignore
    return contract.getItems()
}
