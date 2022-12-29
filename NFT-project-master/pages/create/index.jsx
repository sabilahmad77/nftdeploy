import React, { useState } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css"; // optional
import Collection_dropdown2 from "../../components/dropdown/collection_dropdown2";
import {
  collectionDropdown2_data,
  EthereumDropdown2_data
} from "../../data/dropdown";
import { FileUploader } from "react-drag-drop-files";
import Proparties_modal from "../../components/modal/proparties_modal";
import { useDispatch, useSelector } from "react-redux";
import { showPropatiesModal } from "../../redux/counterSlice";
import Meta from "../../components/Meta";
import { ethers } from "ethers";
import ContractABI from "../../contractABI/ABI.json";
import { pinJSONToIPFS } from "../../contractABI/pinata.js";
import { loadContracts } from "../../contractABI/interact.js";
import axios from "axios";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import axiosInstance from "../../utils/axiosInterceptor";

const Create = () => {
  const fileTypes = [
    "JPG",
    "PNG",
    "GIF",
    "SVG",
    "MP4",
    "WEBM",
    "MP3",
    "WAV",
    "OGG",
    "GLB",
    "GLTF"
  ];

  const router = useRouter();
  const { loggedin } = useSelector((state) => state.counter);
  const [file, setFile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    status: false,
    message: ""
  });
  const [success, setSuccess] = useState({
    status: false,
    message: ""
  });
  // Input state where all user data stored

  const [input, setinput] = useState({
    image: "",
    name: "",
    // externalLink: "",
    description: "",
    Collection: null,
    Unlockable_Content: false,
    Explicit_Sensitive_Content: false,
    Supply: "",
    Blockchain: "Ethereum",
    FreezeMetadata: "",
    price: ""
  });

  const mintNFT = async () => {
    // Conditions of input state
    console.log("error call", input);
    if (
      input.name == "" ||
      // input.FreezeMetadata == "" &&
      input.price == "" ||
      input.image == "" ||
      input.description == ""
    ) {
      // alert("Fill the all fields")
      setError({
        status: true,
        message: "Please fill all fields"
      });
      return;
    }
    setLoading(true);
    setError({
      status: false,
      message: ""
    });

    const { marketplace, nft, address, status } = await loadContracts();

    console.log({ status });

    const metadata = {};
    metadata.name = input.name;
    metadata.image = input.image.name;
    metadata.description = input.description;

    const pinataResponse = await pinJSONToIPFS(metadata);
    console.log({ pinataResponse });
    if (!pinataResponse.success) {
      setError({
        status: true,
        message: "Something went wrong please Try again!"
      });
      return;
    }
    const tokenURI = pinataResponse.pinataUrl;
    console.log("image name", input.image.name);
    console.log("token url", tokenURI);
    console.log("price", input.price);
    try {
      const mint = await nft.mint(tokenURI);
      setSuccess({
        status: false,
        message: "Minting your NFT..."
      });
      await mint.wait();
      console.log({ mint });

      const id = await nft.tokenCount();
      const nftApprove = await nft.approve(marketplace.address, id);
      setSuccess({
        status: false,
        message: "Approving your NFT..."
      });
      await nftApprove.wait();
      console.log("nftApprove", nftApprove);

      // add nft to marketplace
      const itemPrice = ethers.utils.parseEther(input.price.toString());

      console.log("listing", itemPrice);

      const makeItem = await marketplace.makeItem(nft.address, id, itemPrice);
      setSuccess({
        status: false,
        message: "Uploading NFT..."
      });
      console.log("make item", makeItem);
      await makeItem.wait();
      console.log("waiting.... end");

      if (id) {
        console.log("create call with id");
        const formData = new FormData();
        formData.append("id", id);
        formData.append("name", input.name);
        formData.append("price", input.price);
        formData.append("nftImage", input.image);
        formData.append("isBuy", false);
        formData.append("owner", address);
        console.log({ formData }, input.image);
        const res = await axiosInstance.post("/nft/createNft", formData, {});

        setSuccess({
          status: true,
          message: "Congratulations NFT created successfully!"
        });
        setLoading(false);
        setTimeout(() => {
          router.push("/");
        }, 2000);
        console.log("res", res);
      }
    } catch (err) {
      console.log("create error", err.message);
      setLoading(false);
      setError({
        status: true,
        message: "Something went wrong! Please try again"
      });
    }
  };

  // Get value from the collection component for the input.Collection
  const Get_collection_Value = (Collectionvalue) => {
    setinput((prevState) => ({
      ...prevState,
      Collection: { Collectionvalue }
    }));
  };
  // Get value from the collection component for the input.Blockchain
  const Get_Value_Blockchain = (Blockchainvalue) => {
    setinput((prevState) => ({
      ...prevState,
      // Blockchain: { Blockchainvalue }, //old
      Blockchain: 97
    }));
  };
  const dispatch = useDispatch();

  const handleChangeImage = (file) => {
    setFile(file.name);
    setinput((prevState) => ({
      ...prevState,
      // image: file.name, //old
      image: file
    }));
  };
  const handleChange = (e) => {
    setinput((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const popupItemData = [
    {
      id: 1,
      name: "proparties",
      text: "Textual traits that show up as rectangles.",
      icon: "proparties-icon"
    },
    {
      id: 2,
      name: "levels",
      text: "Numerical traits that show as a progress bar.",
      icon: "level-icon"
    },
    {
      id: 3,
      name: "stats",
      text: "Numerical traits that just show as numbers.",
      icon: "stats-icon"
    }
  ];
  return (
    <div>
      <Meta title="Create || Blenny | NFT Marketplace Next.js Template" />
      {/* <!-- Create --> */}
      <section className="relative py-24">
        <picture className="pointer-events-none absolute inset-0 -z-10 dark:hidden">
          <img
            src="/images/gradient_light.jpg"
            alt="gradient"
            className="h-full w-full"
          />
        </picture>
        <div className="container">
          <h1 className="font-display text-jacarta-700 py-16 text-center text-4xl font-medium dark:text-white">
            Create
          </h1>

          <div className="mx-auto max-w-[48.125rem]">
            {/* <!-- File Upload --> */}
            <div className="mb-6">
              <label className="font-display text-jacarta-700 mb-2 block dark:text-white">
                Image, Video, Audio, or 3D Model
                <span className="text-red">*</span>
              </label>

              {file ? (
                <p className="dark:text-jacarta-300 text-2xs mb-3">
                  successfully uploaded : {file}
                </p>
              ) : (
                <p className="dark:text-jacarta-300 text-2xs mb-3">
                  Drag or choose your file to upload
                </p>
              )}

              <div className="dark:bg-jacarta-700 dark:border-jacarta-600 border-jacarta-100 group relative flex max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white py-20 px-5 text-center">
                <div className="relative z-10 cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="fill-jacarta-500 mb-4 inline-block dark:fill-white"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M16 13l6.964 4.062-2.973.85 2.125 3.681-1.732 1-2.125-3.68-2.223 2.15L16 13zm-2-7h2v2h5a1 1 0 0 1 1 1v4h-2v-3H10v10h4v2H9a1 1 0 0 1-1-1v-5H6v-2h2V9a1 1 0 0 1 1-1h5V6zM4 14v2H2v-2h2zm0-4v2H2v-2h2zm0-4v2H2V6h2zm0-4v2H2V2h2zm4 0v2H6V2h2zm4 0v2h-2V2h2zm4 0v2h-2V2h2z" />
                  </svg>
                  <p className="dark:text-jacarta-300 mx-auto max-w-xs text-xs">
                    JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG, GLB, GLTF. Max
                    size: 100 MB
                  </p>
                </div>
                <div className="dark:bg-jacarta-600 bg-jacarta-50 absolute inset-4 cursor-pointer rounded opacity-0 group-hover:opacity-100 ">
                  <FileUploader
                    handleChange={handleChangeImage}
                    //types={fileTypes}
                    name="image"
                    classes="file-drag"
                    maxSize={100}
                    minSize={0}
                  />
                </div>
              </div>
            </div>

            {/* <!-- Name --> */}
            <div className="mb-6">
              <label
                htmlFor="item-name"
                className="font-display text-jacarta-700 mb-2 block dark:text-white"
              >
                Name<span className="text-red">*</span>
              </label>
              <input
                type="text"
                value={input.name}
                onChange={handleChange}
                name="name"
                id="name"
                className="dark:bg-jacarta-700 border-jacarta-100 hover:ring-accent/10 focus:ring-accent dark:border-jacarta-600 dark:placeholder:text-jacarta-300 w-full rounded-lg py-3 px-3 hover:ring-2 dark:text-white"
                placeholder="Item name"
                required
              />
            </div>

            {/* <!-- External Link --> Hidden */}
            <div className=" hidden mb-6">
              <label
                htmlFor="item-external-link"
                className="font-display text-jacarta-700 mb-2 block dark:text-white"
              >
                External link
              </label>
              <p className="dark:text-jacarta-300 text-2xs mb-3">
                We will include a link to this URL on this {"item's"} detail
                page, so that users can click to learn more about it. You are
                welcome to link to your own webpage with more details.
              </p>
              <input
                value={input.externalLink}
                onChange={handleChange}
                name="externalLink"
                type="url"
                id="item-external-link"
                className="dark:bg-jacarta-700 border-jacarta-100 hover:ring-accent/10 focus:ring-accent dark:border-jacarta-600 dark:placeholder:text-jacarta-300 w-full rounded-lg py-3 px-3 hover:ring-2 dark:text-white"
                placeholder="https://yoursite.io/item/123"
              />
            </div>

            {/* <!-- Description --> */}
            <div className="mb-6">
              <label
                htmlFor="item-description"
                className="font-display text-jacarta-700 mb-2 block dark:text-white"
              >
                Description
              </label>
              <p className="dark:text-jacarta-300 text-2xs mb-3">
                The description will be included on the {"item's"} detail page
                underneath its image. Markdown syntax is supported.
              </p>
              <textarea
                value={input.description}
                onChange={handleChange}
                name="description"
                id="item-description"
                className="dark:bg-jacarta-700 border-jacarta-100 hover:ring-accent/10 focus:ring-accent dark:border-jacarta-600 dark:placeholder:text-jacarta-300 w-full rounded-lg py-3 px-3 hover:ring-2 dark:text-white"
                rows="4"
                required
                placeholder="Provide a detailed description of your item."
              ></textarea>
            </div>

            {/* <!-- Collection --> */}
            <div className="relative">
              <div>
                <label className="font-display text-jacarta-700 mb-2 block dark:text-white">
                  Collection
                </label>
                <div className="mb-3 flex items-center space-x-2">
                  <p className="dark:text-jacarta-300 text-2xs">
                    This is the collection where your item will appear.
                    <Tippy
                      theme="tomato-theme"
                      content={
                        <span>
                          Moving items to a different collection may take up to
                          30 minutes.
                        </span>
                      }
                    >
                      <span className="inline-block">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          className="dark:fill-jacarta-300 fill-jacarta-500 ml-1 -mb-[3px] h-4 w-4"
                        >
                          <path fill="none" d="M0 0h24v24H0z"></path>
                          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"></path>
                        </svg>
                      </span>
                    </Tippy>
                  </p>
                </div>
              </div>

              {/* dropdown */}
              <div className="dropdown my-1 cursor-pointer">
                <Collection_dropdown2
                  data={collectionDropdown2_data}
                  collection={true}
                  Get_Value={Get_collection_Value}
                />
              </div>
            </div>

            {/* <!-- Properties --> */}
            {popupItemData.map(({ id, name, text, icon }) => {
              return (
                <div
                  key={id}
                  className="hidden dark:border-jacarta-600 border-jacarta-100 relative border-b py-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      <svg className="icon fill-jacarta-700 mr-2 mt-px h-4 w-4 shrink-0 dark:fill-white">
                        <use xlinkHref={`/icons.svg#icon-${icon}`}></use>
                      </svg>

                      <div>
                        <label className="font-display text-jacarta-700 block dark:text-white">
                          {name}
                        </label>
                        <p className="dark:text-jacarta-300">{text}</p>
                      </div>
                    </div>
                    <button
                      className="group dark:bg-jacarta-700 hover:bg-accent border-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-white hover:border-transparent"
                      onClick={() => dispatch(showPropatiesModal())}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="fill-accent group-hover:fill-white"
                      >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}

            <Proparties_modal />

            {/* <!-- Properties --> */}

            {/* <!-- Unlockable Content --> */}
            <div className="dark:border-jacarta-600 border-jacarta-100 relative border-b py-6">
              <div className="flex items-center justify-between">
                <div className="flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="fill-accent mr-2 mt-px h-4 w-4 shrink-0"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M7 10h13a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1V9a7 7 0 0 1 13.262-3.131l-1.789.894A5 5 0 0 0 7 9v1zm-2 2v8h14v-8H5zm5 3h4v2h-4v-2z" />
                  </svg>

                  <div>
                    <label className="font-display text-jacarta-700 block dark:text-white">
                      Unlockable Content
                    </label>
                    <p className="dark:text-jacarta-300">
                      Include unlockable content that can only be revealed by
                      the owner of the item.
                    </p>
                  </div>
                </div>
                <input
                  value={input.Unlockable_Content}
                  onChange={() => {
                    setinput((prevState) => ({
                      ...prevState,
                      Unlockable_Content: !input.Unlockable_Content
                    }));
                  }}
                  type="checkbox"
                  // value="checkbox"
                  name="Unlockable_Content"
                  className="checked:bg-accent checked:focus:bg-accent checked:hover:bg-accent after:bg-jacarta-400 bg-jacarta-100 relative h-6 w-[2.625rem] cursor-pointer appearance-none rounded-full border-none after:absolute after:top-[0.1875rem] after:left-[0.1875rem] after:h-[1.125rem] after:w-[1.125rem] after:rounded-full after:transition-all checked:bg-none checked:after:left-[1.3125rem] checked:after:bg-white focus:ring-transparent focus:ring-offset-0"
                />
              </div>
            </div>

            {/* <!-- Explicit & Sensitive Content --> */}
            <div className="dark:border-jacarta-600 border-jacarta-100 relative mb-6 border-b py-6">
              <div className="flex items-center justify-between">
                <div className="flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="fill-jacarta-700 mr-2 mt-px h-4 w-4 shrink-0 dark:fill-white"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M12.866 3l9.526 16.5a1 1 0 0 1-.866 1.5H2.474a1 1 0 0 1-.866-1.5L11.134 3a1 1 0 0 1 1.732 0zM11 16v2h2v-2h-2zm0-7v5h2V9h-2z" />
                  </svg>

                  <div>
                    <label className="font-display text-jacarta-700 dark:text-white">
                      Explicit & Sensitive Content
                    </label>

                    <p className="dark:text-jacarta-300">
                      Set this item as explicit and sensitive content.
                      <Tippy
                        content={
                          <span>
                            Setting your asset as explicit and sensitive
                            content, like pornography and other not safe for
                            work (NSFW) content, will protect users with safe
                            search while browsing Blenny
                          </span>
                        }
                      >
                        <span className="inline-block">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="dark:fill-jacarta-300 fill-jacarta-500 ml-2 -mb-[2px] h-4 w-4"
                          >
                            <path fill="none" d="M0 0h24v24H0z"></path>
                            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"></path>
                          </svg>
                        </span>
                      </Tippy>
                    </p>
                  </div>
                </div>
                <input
                  value={input.Explicit_Sensitive_Content}
                  onChange={() => {
                    setinput((prevState) => ({
                      ...prevState,
                      Explicit_Sensitive_Content:
                        !input.Explicit_Sensitive_Content
                    }));
                  }}
                  type="checkbox"
                  name="Explicit_Sensitive_Content"
                  className="checked:bg-accent checked:focus:bg-accent checked:hover:bg-accent after:bg-jacarta-400 bg-jacarta-100 relative h-6 w-[2.625rem] cursor-pointer appearance-none rounded-full border-none after:absolute after:top-[0.1875rem] after:left-[0.1875rem] after:h-[1.125rem] after:w-[1.125rem] after:rounded-full after:transition-all checked:bg-none checked:after:left-[1.3125rem] checked:after:bg-white focus:ring-transparent focus:ring-offset-0"
                />
              </div>
            </div>

            {/* <!-- Supply --> */}
            <div className="mb-6">
              <label
                htmlFor="item-supply"
                className="font-display text-jacarta-700 mb-2 block dark:text-white"
              >
                Supply
              </label>

              <div className="mb-3 flex items-center space-x-2">
                <p className="dark:text-jacarta-300 text-2xs">
                  The number of items that can be minted. No gas cost to you!
                  <Tippy
                    content={
                      <span>
                        Setting your asset as explicit and sensitive content,
                        like pornography and other not safe for work (NSFW)
                        content, will protect users with safe search while
                        browsing Blenny.
                      </span>
                    }
                  >
                    <span className="inline-block">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="dark:fill-jacarta-300 fill-jacarta-500 ml-1 -mb-[3px] h-4 w-4"
                      >
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"></path>
                      </svg>
                    </span>
                  </Tippy>
                </p>
              </div>

              <input
                value={input.Supply}
                onChange={handleChange}
                name="Supply"
                type="text"
                id="item-supply"
                className="dark:bg-jacarta-700 border-jacarta-100 hover:ring-accent/10 focus:ring-accent dark:border-jacarta-600 dark:placeholder:text-jacarta-300 w-full rounded-lg py-3 px-3 hover:ring-2 dark:text-white"
                placeholder="1"
              />
            </div>

            {/* <!-- Blockchain --> */}
            <div className=" hidden mb-6">
              <label
                htmlFor="item-supply"
                className="font-display text-jacarta-700 mb-2 block dark:text-white"
              >
                Blockchain
              </label>

              {/* dropdown */}
              <div className=" dropdown relative mb-4 cursor-pointer ">
                <Collection_dropdown2
                  data={EthereumDropdown2_data}
                  Get_Value={Get_Value_Blockchain}
                />
              </div>
            </div>

            {/* <!-- Freeze metadata --> */}
            <div className="mb-6">
              <div className="mb-2 flex items-center space-x-2">
                <label
                  htmlFor="item-freeze-metadata"
                  className="font-display text-jacarta-700 block dark:text-white"
                >
                  {/* Freeze metadata */} NFT Price
                </label>

                <Tippy
                  content={
                    <span className="bg-jacarta-300">
                      {/* Setting your asset as explicit and sensitive content, like
                      pornography and other not safe for work (NSFW) content,
                      will protect users with safe search while browsing Blenny. */}
                      Enter the price on which you want to sell.
                    </span>
                  }
                >
                  <span className="inline-block">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="dark:fill-jacarta-300 fill-jacarta-500 mb-[2px] h-5 w-5"
                    >
                      <path fill="none" d="M0 0h24v24H0z"></path>
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"></path>
                    </svg>
                  </span>
                </Tippy>
              </div>

              {/* <p className="dark:text-jacarta-300 text-2xs mb-3">
                Freezing your metadata will allow you to permanently lock and
                store all of this
                {"item's"} content in decentralized file storage.
              </p>

              <input
                value={input.FreezeMetadata}
                onChange={handleChange}
                type="text"
                name="FreezeMetadata"
                id="FreezeMetadata"
                className="dark:bg-jacarta-700 bg-jacarta-50 border-jacarta-100 dark:border-jacarta-600 dark:placeholder:text-jacarta-300 w-full rounded-lg py-3 px-3 dark:text-white"
                placeholder="To freeze your metadata, you must create your item first."
              /> */}

              <p className="dark:text-jacarta-300 text-2xs mb-3">Price</p>

              <input
                value={input.price}
                onChange={handleChange}
                type="text"
                name="price"
                id="item-supply"
                className="dark:bg-jacarta-700 bg-jacarta-50 border-jacarta-100 dark:border-jacarta-600 dark:placeholder:text-jacarta-300 w-full rounded-lg py-3 px-3 dark:text-white"
                placeholder="Enter Price."
              />
            </div>

            {/* <!-- Submit --> */}

            <div className="flex flex-col md:flex-row text-center space-x-6 ">
              {loggedin ? (
                <span>
                  {" "}
                  {loading ? (
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        className="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                      <span className="text-green">
                        {!success.status && success.message}
                        {success.status &&
                          success.message === "" &&
                          "Please wait your NFT creation take time..."}
                      </span>
                    </div>
                  ) : (
                    <button
                      id="CreateButton"
                      // onClick={CreateNFT}
                      onClick={mintNFT}
                      className=" bg-accent-dark cursor-pointer rounded-full py-3 px-8 text-center font-semibold text-white transition-all"
                    >
                      Create
                    </button>
                  )}
                  {error.status === true && (
                    <p
                      id="Error"
                      className="py-3 font-semibold text-red transition-all"
                    >
                      <span>{error.message}</span>
                    </p>
                  )}
                  {success.status === true && (
                    <p
                      id="Error"
                      className="py-3 font-semibold text-green transition-all"
                    >
                      <span>{success.message}</span>
                    </p>
                  )}
                </span>
              ) : (
                <span className="flex space-x-3">
                  {" "}
                  <Link href="/login">
                    <a>
                      <button className=" bg-accent-dark cursor-pointer rounded-full py-3 px-8 text-center font-semibold text-white transition-all">
                        Login
                      </button>{" "}
                    </a>
                  </Link>
                  <p
                    id="Error"
                    className=" py-3 font-semibold text-red transition-all"
                  >
                    <span>You have to login first</span>
                  </p>
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* <!-- end create --> */}
    </div>
  );
};

export default Create;
