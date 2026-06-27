import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const CONTRACT_ADDRESS = '0x9698d1538b3033ea8e2051fe8f5c2d95be3daa35'

const ABI = [
  { inputs: [{ name: 'index', type: 'uint256' }], name: 'options', outputs: [{ name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
] as const

const client = createPublicClient({
  chain: base,
  transport: http(),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const index = searchParams.get('index')

  if (!index) {
    return NextResponse.json({ error: 'Missing index' }, { status: 400 })
  }

  try {
    const data = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'options',
      args: [BigInt(index)],
    })

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch option' }, { status: 500 })
  }
}
