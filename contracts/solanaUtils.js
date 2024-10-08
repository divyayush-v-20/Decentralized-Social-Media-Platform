import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import idl from './idl.json';

const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl('devnet');
const opts = {
  preflightCommitment: "processed"
};

const getProvider = () => {
  const connection = new Connection(network, opts.preflightCommitment);
  const provider = new AnchorProvider(
    connection, window.solana, opts.preflightCommitment,
  );
  return provider;
};

export const connectWallet = async () => {
  try {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      return response.publicKey.toString();
    }
  } catch (error) {
    console.error(error);
  }
};

export const createPost = async (walletAddress, content) => {
  const provider = getProvider();
  const program = new Program(idl, programID, provider);

  try {
    const [postPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("post"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods.createPost(content).accounts({
      post: postPDA,
      author: provider.wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    }).rpc();

    return { id: postPDA.toString(), content, likes: 0, comments: [] };
  } catch (error) {
    console.error("Error creating post:", error);
  }
};

export const likePost = async (walletAddress, postId) => {
  const provider = getProvider();
  const program = new Program(idl, programID, provider);

  try {
    const postPDA = new PublicKey(postId);

    await program.methods.likePost().accounts({
      post: postPDA,
      user: provider.wallet.publicKey,
    }).rpc();
  } catch (error) {
    console.error("Error liking post:", error);
  }
};

export const addComment = async (walletAddress, postId, content) => {
  const provider = getProvider();
  const program = new Program(idl, programID, provider);

  try {
    const postPDA = new PublicKey(postId);
    const [commentPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("comment"), postPDA.toBuffer(), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods.addComment(content).accounts({
      comment: commentPDA,
      post: postPDA,
      author: provider.wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    }).rpc();

    return content;
  } catch (error) {
    console.error("Error adding comment:", error);
  }
};