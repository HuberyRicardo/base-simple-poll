'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet'
import { Avatar, Name, Identity, Address } from '@coinbase/onchainkit/identity'
import { trackTransaction } from '@/utils/track'

const CONTRACT_ADDRESS = '0x9698d1538b3033ea8e2051fe8f5c2d95be3daa35' as const

const ABI = [
  { inputs: [{ name: '_question', type: 'string' }, { name: '_options', type: 'string[]' }], stateMutability: 'nonpayable', type: 'constructor' },
  { anonymous: false, inputs: [{ indexed: true, name: 'voter', type: 'address' }, { indexed: false, name: 'option', type: 'uint256' }], name: 'Voted', type: 'event' },
  { inputs: [{ name: 'optionIndex', type: 'uint256' }], name: 'vote', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'question', outputs: [{ name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getOptionsCount', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'index', type: 'uint256' }], name: 'options', outputs: [{ name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'index', type: 'uint256' }], name: 'getVotes', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getAllResults', outputs: [{ name: '', type: 'uint256[]' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getWinner', outputs: [{ name: 'winnerIndex', type: 'uint256' }, { name: 'winnerVotes', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: '', type: 'address' }], name: 'voted', outputs: [{ name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'totalVotes', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
] as const

export default function PollPage() {
  const { address } = useAccount()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  const { data: question } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'question',
  })

  const { data: optionsCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getOptionsCount',
  })

  const { data: hasVoted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'voted',
    args: address ? [address] : undefined,
  })

  const { data: allResults } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getAllResults',
  })

  const { data: winner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getWinner',
  })

  const [options, setOptions] = useState<string[]>([])

  useEffect(() => {
    const fetchOptions = async () => {
      if (!optionsCount) return
      const opts: string[] = []
      for (let i = 0; i < Number(optionsCount); i++) {
        const { data } = await fetch(`/api/option?index=${i}`).then(r => r.json())
        opts.push(data || `Option ${i}`)
      }
      setOptions(opts)
    }
    fetchOptions()
  }, [optionsCount])

  const { data: hash, writeContract, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isSuccess && hash) {
      trackTransaction('app-003', 'BaseSimplePoll', address, hash)
    }
  }, [isSuccess, hash, address])

  const handleVote = () => {
    if (selectedOption === null) return
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'vote',
      args: [BigInt(selectedOption)],
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="flex justify-end mb-6">
          <Wallet>
            <ConnectWallet>
              <Avatar className="h-6 w-6" />
              <Name />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address />
              </Identity>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BaseSimplePoll</h1>
          <p className="text-gray-600 mb-6">On-chain voting made simple</p>

          {question && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{question}</h2>
            </div>
          )}

          {!address ? (
            <div className="text-center py-8 text-gray-500">
              Connect your wallet to vote
            </div>
          ) : hasVoted ? (
            <div className="space-y-4">
              <p className="text-green-600 font-medium mb-4">✓ You have already voted</p>
              {options.map((opt, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{opt}</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {allResults ? Number(allResults[idx]) : 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{
                        width: allResults
                          ? `${(Number(allResults[idx]) / Math.max(...allResults.map(Number), 1)) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              ))}
              {winner && (
                <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                  <p className="text-lg font-bold text-yellow-800">
                    🏆 Current Winner: {options[Number(winner[0])]} ({Number(winner[1])} votes)
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {options.map((opt, idx) => (
                <label
                  key={idx}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedOption === idx
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="poll"
                    className="mr-3"
                    checked={selectedOption === idx}
                    onChange={() => setSelectedOption(idx)}
                  />
                  <span className="font-medium">{opt}</span>
                </label>
              ))}
              <button
                onClick={handleVote}
                disabled={selectedOption === null || isPending || isConfirming}
                className="w-full mt-6 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Confirming...' : isConfirming ? 'Voting...' : 'Vote'}
              </button>
              {isSuccess && (
                <p className="text-green-600 text-center mt-4">✓ Vote successful!</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Contract: {CONTRACT_ADDRESS}</p>
          <p className="mt-1">Powered by Base</p>
        </div>
      </div>
    </div>
  )
}
