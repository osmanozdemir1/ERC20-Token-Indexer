import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Stack,
  Text,
  Tag
} from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState } from 'react';
import { ethers } from 'ethers';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const config = {
  apiKey: 'WRITE YOUR API KEY HERE',
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

function App() {
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState();
  const [account, setAccount] = useState();

  async function connectWallet() {
    if(!window.ethereum){
      alert("MetaMask is not installed!")
    } 

    const accounts = await provider.send('eth_requestAccounts', []);
    setAccount(accounts[0]);
  }

  async function getTokenBalance(address) {
    const data = await alchemy.core.getTokenBalances(address);
    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      );
      tokenDataPromises.push(tokenData);
    }

    setHasQueried(true);
    setTokenDataObjects(await Promise.all(tokenDataPromises));
  }

  async function getWalletBalance(){
    if(!account){
      alert("Please Connect Wallet")
    }
    await getTokenBalance(account);
  }

  async function getQueryBalance(){
    const addr = document.getElementById('inputAddress').value;
    const isAddress = ethers.utils.isAddress(addr);
    const isENS = await alchemy.core.resolveName(addr);
    if (!isAddress && isENS == null){
      alert("Please type a valid address!");
    } else {
      await getTokenBalance(addr);
    }
  }

  return (
    <Box w="100vw">
      <Stack align="end" m={5}>
        {!account ? (
        <Button variant="outline" onClick={connectWallet} size="sm" colorScheme="teal">
          Connect Wallet
        </Button>) : (
        <Tag size="sm" colorScheme="teal">
          Connected
        </Tag>
        )}
      </Stack>
      <Center m={10}>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={2} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
          <Button fontSize={20} onClick={getWalletBalance} mt={3} colorScheme="teal">
            Click to see your ERC-20 Token Balances
          </Button>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading mt={45} fontSize={24}>
          Search token balances of this address:
        </Heading>
        <Input
          id="inputAddress"
          color="black"
          w="500px"
          textAlign="center"
          placeholder='Please Type a Wallet Address'
          _placeholder={{opacity: 0.4, color:'grey', fontSize:'20'}}
          p={4}
          bgColor="white"
          fontSize={24}
        />
        <Button fontSize={20} onClick={getQueryBalance} mt={3} colorScheme="telegram">
          Check ERC-20 Token Balances
        </Button>

        <Heading mt={12} mb={2} fontSize={24}>ERC-20 token balances:</Heading>

        {hasQueried ? ( 
          <div>
            {
              !tokenDataObjects ? (
                <Alert status='info'>
                  <AlertIcon />
                  <AlertDescription>
                    Tokens are loading...
                  </AlertDescription>
                </Alert>
                ) : (
                <SimpleGrid w={'90vw'} columns={4} spacing={24}>
                  {results.tokenBalances.map((e, i) => {
                    return (
                      <Flex
                        flexDir={'column'}
                        color="black"
                        bg="blue.200"
                        w={'20vw'}
                        key={e.id}
                      >
                        <Box>
                          <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                        </Box>
                        <Box>
                          <b>Balance:</b>&nbsp;
                          {Utils.formatUnits(
                            e.tokenBalance,
                            tokenDataObjects[i].decimals
                          ).slice(0,6)}...
                        </Box>
                        <Image src={'https://ethereum.org/static/a183661dd70e0e5c70689a0ec95ef0ba/13c43/eth-diamond-purple.png'}/>
                      </Flex>
                    );
                  })}
                </SimpleGrid>
              )
            }
          </div>
        ) : (
          'Please make a query! This may take a few seconds...'
        )}
      </Flex>
    </Box>
  );
}

export default App;
