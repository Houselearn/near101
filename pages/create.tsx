import { Button, Input, Layout, Select } from "components";
import { useNearContext } from "lib/utils/nearweb3";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {addNewItem, getItem} from "../lib/utils/market"
import { range } from 'lodash';
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Alert } from "react-bootstrap";

function Create() {
  const { accountId, login } = useNearContext();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit } = useForm<any>({ defaultValues: { duration: "86400", type: "0" } });
  const { contract } = useNearContext();

  async function handleCreate(params) {
    let id: string ="/"
    if(contract === null) {
      return
    }
    if (!accountId) {
      await login();
    } 
    try {
      setLoading(true)
      id = await addNewItem({name:params.name, description:params.description, image:params.image, location:params.location, price:params.price}, contract)
      toast.success('Listing created') 
    } catch(e) {
      console.log({ e });
      toast.error("Failed to create a product.");
    } finally {
      setLoading(false)
      router.push(`/items/${id}`); 
    }
  }

  const buttonLabel = !accountId ? 'Connect Wallet' : 'Create Listing';

  return (
    <Layout>
      <div className="container my-12">
        <div className="max-w-lg mx-auto bg-gray-900 rounded-sm p-8">
          <h1 className="text-3xl font-semibold text-red-500">Create Listing</h1>
          <p>
            Create a New Item listing using this form.
          </p>
          <hr className="my-8" />
          <form onSubmit={handleSubmit(handleCreate)}>
            <div className="space-y-6">
              <div>
                <Input
                  label="Item Name"
                  {...register('name', { required: true })}
                />
              </div>
              <div>
                <Input
                  label="Item Description"
                  {...register('description', { required: true })}
                />
              </div>
              <div>
                <Input
                  label="Item Image URL"
                  {...register('image', { required: true })}
                />
              </div>
              <div>
                <Input
                
                  label="Item Location"
                  {...register('location', { required: true })}
                />
              </div>
              <div>
                <Input
                  type="number"
                  label="Price (in NEAR)"
                  {...register('price', { required: true })}
                />
              </div>
              <Button type="submit" loading={loading}>
                {buttonLabel}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default Create;