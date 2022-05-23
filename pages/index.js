import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useMetaMask } from "metamask-react";
import abi from "../constant/abi";

const Home = () => {
  const [signer, setSigner] = useState(undefined);
  const [xdai, setXdai] = useState(0);
  const [ninja, setNinja] = useState(0);
  const [smartAddress, setSmartAddress] = useState("");
  const [smartAddressValidated, setSmartAddressValidated] = useState(false);

  // Init useMetamak
  const { status, account, connect, chainId, ethereum } = useMetaMask();

  // Get provider with ehthers
  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    status === "connected" && setSigner(provider.getSigner());
  }, [status]);

  // Connection to Metamask with ethers
  async function connection() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await ethereum.request({ method: "eth_requestAccounts" });
        connect();
      } catch (err) {
        console.log(err);
      }
    }
  }

  // Get xDai balance
  const getBalance = () => {
    ethereum
      .request({
        method: "eth_getBalance",
        params: [account, "latest"],
      })
      .then((result) => {
        setXdai(parseInt(result, 16) / Math.pow(10, 18));
      })
      .catch((error) => {
        console.log("error : " + error);
      });
  };

  // Get ninja token balance
  async function getBalanceSmartContracts() {
    if (typeof window.ethereum !== "undefined") {
      // smart contract address
      const contractAddress = smartAddressValidated;
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        await contract
          // chain address
          .balanceOf("0x3cC29078bb2c8916911D97CF6FA94c2FDe840Eb6")
          .then((balance) => ethers.utils.formatUnits(balance, 18))
          .then((res) => setNinja(res));
        // setNinja(contract.name);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  // Switch Chain
  const switchChain = (chain) => {
    try {
      ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chain }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chain,
                chainName: "...",
                rpcUrls: ["https://..."] /* ... */,
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
        }
      }
      // handle other "switch" errors
    }
  };

  // Send transactions
  async function sendTransaction() {
    if (typeof window.ethereum !== "undefined") {
      // smart contract address
      const contractAddress = "0xf4eDe6409fd5E45AA8C3ac2f7755E28C5F930a9d";
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const daiWithSigner = contract.connect(signer);
        // Each DAI has 18 decimal places
        const xdai = ethers.utils.parseUnits("5000", 18);
        await daiWithSigner.transfer(
          // target chain
          "0xeF6534c74392eC47430aA8e0Cd5664d1957d183d",
          xdai
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <div className="flex items-center justify-around w-full min-h-screen overflow-auto bg-gray-300">
      {status === "connected" ? (
        <div className="flex flex-col items-center">
          <p className="my-4">Account logged : {account}</p>
          <p className="my-4">Chain id : {chainId}</p>
          <p className="my-2">Switch Chain</p>
          <div className="flex justify-between w-1/2 my-3">
            <button onClick={() => switchChain("0x1")}>ETH</button>
            <button onClick={() => switchChain("0x64")}>XDAI</button>
          </div>
          <h1 className="my-4">Tokens</h1>
          <p className="my-4">Balance XDAI : {xdai}</p>
          <h2 className="my-4">Balance Smart Contract</h2>
          <p>Balance Ninja : {ninja}</p>
          <label for="smartAddress">Enter your smart contract address</label>
          <input
            className="w-full py-1 my-3 text-center rounded"
            id="smartAddress"
            onChange={(e) => setSmartAddress(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setSmartAddressValidated(smartAddress)}
          >
            Validate
          </button>
          {smartAddressValidated && (
            <p className="my-3">{smartAddressValidated}</p>
          )}

          <div className="flex justify-around w-3/4 my-5">
            <button onClick={() => getBalance()}>Get XDAI</button>
            <button onClick={() => getBalanceSmartContracts()}>
              Get Ninja
            </button>
            <button onClick={() => sendTransaction()}>Send</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-sreen">
          <button onClick={() => connection()}>
            Connect with your Metamask
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
