# Dacade Solidity NFT Course Assignment

### How to test

This is a simple NFT marketplace where anyone can create an auction with their NFT, anyone can bid within a specified time, highest bid gets the NFT, auctioneer gets his money and the rest get their refunds. 
Kindly follow the instructions to test the full flow. 

1. Get a full ipfs link and paste it in the mintToken function (can upload an image to pinata to get one).
2. In the transaction details, you will see the transfer event with the tokenId.
3. Copy that ID, and in the createAuction tab, put it in the tokenId section. Fill in the remaining details.
4. I advise to put 240 in the end time so you will be able to test well before the auction ends and to make start price low.
5. In the transaction details of the create auction, under the new transfer event, you will see the id. Copy it and paste it in the bid function.
6. If you try to bid after setting a value, the transaction will revert because the owner can't bid. So I advice you change to another account.
7. You can try bidding now. You can see that an error will pop up if you try to bid lower than the price you set first.
8. Connect another account, and try to bid. Still with same ID... If you put a value lower than the previous bid, it will revert!
9. If you switch back to the first account and try to bid lower than the previous bid. It won't work.
10. If you bid any amount, it will be added to your total bids. So if the second person bid was 7 and your previous bid was 5, you just have to bid 3 and you will become the highest bidder with 8
11. You can continue the flow until the time is up. If the time is up, you won't be able to bid anymore.
12. If you call time up with the account that created the auction, the highest resulting bid will be sent to him. If you try and call it again, it won't work!!! 
13. If you call time up with the account with the highest bid, he gets his NFT.
14. If you call time up with any account that bidded but didn't win, he gets his money refunded. If you try twice or with an account that never bidded, it won't work!!! 

And that's it on testing the contract. I'm open to feedback and suggestions 😊
