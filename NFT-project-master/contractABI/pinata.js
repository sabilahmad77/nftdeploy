const key = "7b8121c59dfc78c4098a";

const secret =
  "b5dde682e1cbff9fce2dde1b5b6061d71ea9fc4c9e146562a2b7efa0834926af";
const axios = require("axios");

export const pinJSONToIPFS = async (JSONBody) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  return axios
    .post(url, JSONBody, {
      headers: {
        pinata_api_key: key,
        pinata_secret_api_key: secret
      }
    })
    .then(function (response) {
      return {
        success: true,
        pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
      };
    })
    .catch(function (error) {
      console.log(error);
      return {
        success: false,
        message: error.message
      };
    });
};
