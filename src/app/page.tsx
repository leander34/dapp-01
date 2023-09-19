'use client'
import { ethers, Provider, } from 'ethers'
import { FormEvent, useState } from "react"
import ABI from '@/abi.json'



type GetProvider = () => Promise<ethers.BrowserProvider | null>


export default function Home() {
  const [bookId, setBookId] = useState('')
  const [title, setTitle] = useState('')
  const [year, setYear] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const CONTRACT_ADDRESS = '0xAf307Afe5EC63cB98432297635C383E60133160c' 
  const getProvider: GetProvider = async () => {
  if(!window.ethereum){
    setMessage("No wallet found!")
    return null
  }

    const provider = new ethers.BrowserProvider(window.ethereum)

    const accounts = await provider.send("eth_requestAccounts", [])

    if(!accounts || accounts.length === 0) {
      setMessage("Wallet not authorized.")
      return null
    }

    return provider
  }
  const doSearch = async () => {
    
    try {
      const provider = await getProvider()
  
      if(!provider) {
        return
      }
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)
      const book = await contract.getBook(bookId)
      console.log({
        title: book[0],
        year: Number(book[1])
      })
      
      setMessage(JSON.stringify({
        title: book[0],
        year: Number(book[1])
      }))

    } catch (error: any) {
      setMessage(error.message)
    }
  }

  const doCreate = async () => {
    try {
      const provider = await getProvider()

      if(!provider) {
        return
      }

      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)
      const contractSigner = contract.connect(signer)

      const tx = await contractSigner.addBook({ title: title, year: year })
      setMessage(JSON.stringify(tx))
    } catch (error: any) {
      setMessage(error.message)
      
    }
  }

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    await doSearch()
  }

  const handleCreateBook = async (e: FormEvent) => {
    e.preventDefault()
    await doCreate()

  }
  return (
    <div className="p-3">
      <header className='flex items-center justify-center py-4 bg-emerald-500 rounded-sm'>
        <span className='text-gray-50 text-lg'>Dapp</span>
      </header>
      <div className='flex flex-col items-center justify-center mt-6'>
        <form onSubmit={handleSearch} className="flex flex-col gap-2 w-[300px]">
        <label htmlFor="" className='text-gray-50'>Book ID</label>
        <input type="text"
        className='p-2 rounded-md shadow-md'
          value={bookId} 
          onChange={(e) => setBookId(e.target.value)} />

        <button className='bg-purple-500 rounded-md shadow-md p-2 text-white'>Pesquisar</button>  
      </form>
      <p className='text-gray-200 mt-1'>{message}</p>

      <form onSubmit={handleCreateBook} className="flex flex-col gap-2 w-[300px] mt-6">
        <label htmlFor="" className='text-gray-50'>Title</label>
        <input type="text" 
          value={title} 
          className='p-2 rounded-md shadow-md'
          onChange={(e) => setTitle(e.target.value)} />

          <label htmlFor="" className='text-gray-50'>Year</label>
        <input type="number" 
          value={year || undefined} 
          className='p-2 rounded-md shadow-md'
          onChange={(e) => setYear(e.target.valueAsNumber)} />

        <button className='bg-blue-500 rounded-md shadow-md p-2 text-white'>Salvar livro</button>  
      </form>
      </div>
    </div>
  )
}
