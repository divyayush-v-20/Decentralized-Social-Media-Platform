use anchor_lang::prelude::*;

#[program]
pub mod decentralized_social_media {
    use super::*;

    pub fn create_post(ctx: Context<CreatePost>, content: String) -> Result<()> {
        let post = &mut ctx.accounts.post;
        let author = &ctx.accounts.author;

        post.author = *author.key;
        post.content = content;
        post.likes = 0;

        
        Ok(())
    }

    pub fn like_post(ctx: Context<LikePost>) -> Result<()> {
        let post = &mut ctx.accounts.post;
        post.likes += 1;
        Ok(())
    }

    pub fn add_comment(ctx: Context<AddComment>, content: String) -> Result<()> {
        let comment = &mut ctx.accounts.comment;
        let author = &ctx.accounts.author;
        let post = &mut ctx.accounts.post;

        comment.author = *author.key;
        comment.content = content;
        comment.post = post.key();

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreatePost<'info> {
    #[account(init, payer = author, space = 8 + 32 + 256 + 8)]
    pub post: Account<'info, Post>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LikePost<'info> {
    #[account(mut)]
    pub post: Account<'info, Post>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct AddComment<'info> {
    #[account(init, payer = author, space = 8 + 32 + 256 + 32)]
    pub comment: Account<'info, Comment>,
    #[account(mut)]
    pub post: Account<'info, Post>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Post {
    pub author: Pubkey,
    pub content: String,
    pub likes: u64,
}

#[account]
pub struct Comment {
    pub author: Pubkey,
    pub content: String,
    pub post: Pubkey,
}
