import fs from 'fs/promises';
import path from 'path';

export class TemplateGenerator {
  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  initializeTemplates() {
    // Basic Move contract templates
    this.templates.set('basic', {
      name: 'Basic Module',
      description: 'A basic Move module template',
      files: {
        'Move.toml': this.getProjectToml(),
        'sources/main.move': this.getBasicModule()
      }
    });

    this.templates.set('nft', {
      name: 'NFT Collection',
      description: 'NFT collection with minting and trading',
      files: {
        'Move.toml': this.getProjectToml(),
        'sources/nft.move': this.getNFTModule(),
        'sources/marketplace.move': this.getMarketplaceModule()
      }
    });

    this.templates.set('defi', {
      name: 'DeFi Protocol',
      description: 'Basic DeFi protocol with liquidity pools',
      files: {
        'Move.toml': this.getProjectToml(),
        'sources/pool.move': this.getDeFiPoolModule(),
        'sources/token.move': this.getTokenModule()
      }
    });

    this.templates.set('game', {
      name: 'Game Contract',
      description: 'Simple game contract with player management',
      files: {
        'Move.toml': this.getProjectToml(),
        'sources/game.move': this.getGameModule(),
        'sources/player.move': this.getPlayerModule()
      }
    });

    this.templates.set('dao', {
      name: 'DAO Contract',
      description: 'Decentralized Autonomous Organization',
      files: {
        'Move.toml': this.getProjectToml(),
        'sources/dao.move': this.getDAOModule(),
        'sources/proposal.move': this.getProposalModule(),
        'sources/voting.move': this.getVotingModule()
      }
    });
  }

  async generateProject(projectName, templateType = 'basic') {
    const template = this.templates.get(templateType);
    if (!template) {
      throw new Error(`Template '${templateType}' not found`);
    }

    const projectPath = path.join(process.cwd(), projectName);
    
    try {
      await fs.mkdir(projectPath, { recursive: true });
      await fs.mkdir(path.join(projectPath, 'sources'), { recursive: true });
      await fs.mkdir(path.join(projectPath, 'tests'), { recursive: true });

      const createdFiles = [];
      for (const [filePath, content] of Object.entries(template.files)) {
        const fullPath = path.join(projectPath, filePath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        
        const processedContent = this.processTemplate(content, {
          projectName,
          timestamp: new Date().toISOString(),
          author: process.env.USER || 'developer'
        });
        
        await fs.writeFile(fullPath, processedContent);
        createdFiles.push(filePath);
      }

      // Generate test files
      const testFiles = await this.generateTestFiles(templateType, projectName);
      for (const [filePath, content] of Object.entries(testFiles)) {
        const fullPath = path.join(projectPath, 'tests', filePath);
        await fs.writeFile(fullPath, content);
        createdFiles.push(`tests/${filePath}`);
      }

      return {
        template: template.name,
        path: projectPath,
        files: createdFiles,
        structure: this.getProjectStructure(createdFiles)
      };
    } catch (error) {
      throw new Error(`Failed to generate project: ${error.message}`);
    }
  }

  async generateContract(specification) {
    // AI-assisted contract generation based on natural language specification
    const contractType = this.analyzeSpecification(specification);
    const template = this.templates.get(contractType) || this.templates.get('basic');
    
    const customContract = await this.customizeTemplate(template, specification);
    
    return {
      code: customContract.code,
      tests: customContract.tests,
      suggestions: customContract.suggestions,
      documentation: customContract.documentation
    };
  }

  analyzeSpecification(specification) {
    const spec = specification.toLowerCase();
    
    if (spec.includes('nft') || spec.includes('collectible') || spec.includes('token')) {
      return 'nft';
    }
    
    if (spec.includes('defi') || spec.includes('pool') || spec.includes('swap') || spec.includes('liquidity')) {
      return 'defi';
    }
    
    if (spec.includes('game') || spec.includes('player') || spec.includes('score')) {
      return 'game';
    }
    
    if (spec.includes('dao') || spec.includes('governance') || spec.includes('voting')) {
      return 'dao';
    }
    
    return 'basic';
  }

  async customizeTemplate(template, specification) {
    // This would integrate with AI to customize the template based on specification
    // For now, we'll return the basic template with some customizations
    
    const customizations = this.extractCustomizations(specification);
    
    return {
      code: this.applyCustomizations(template.files['sources/main.move'] || Object.values(template.files)[1], customizations),
      tests: this.generateCustomTests(customizations),
      suggestions: this.generateSuggestions(customizations),
      documentation: this.generateDocumentation(customizations)
    };
  }

  extractCustomizations(specification) {
    // Extract key features and requirements from specification
    return {
      functions: this.extractFunctions(specification),
      structs: this.extractStructs(specification),
      events: this.extractEvents(specification),
      constants: this.extractConstants(specification)
    };
  }

  extractFunctions(specification) {
    // Simple regex-based extraction - would be enhanced with NLP
    const functionPattern = /(function|method|action)\s+(\w+)/gi;
    const matches = [...specification.matchAll(functionPattern)];
    return matches.map(match => match[2]);
  }

  extractStructs(specification) {
    const structPattern = /(struct|type|object)\s+(\w+)/gi;
    const matches = [...specification.matchAll(structPattern)];
    return matches.map(match => match[2]);
  }

  extractEvents(specification) {
    const eventPattern = /(event|emit|trigger)\s+(\w+)/gi;
    const matches = [...specification.matchAll(eventPattern)];
    return matches.map(match => match[2]);
  }

  extractConstants(specification) {
    const constantPattern = /(constant|const)\s+(\w+)/gi;
    const matches = [...specification.matchAll(constantPattern)];
    return matches.map(match => match[2]);
  }

  applyCustomizations(baseCode, customizations) {
    let code = baseCode;
    
    // Add custom functions
    if (customizations.functions.length > 0) {
      const functions = customizations.functions.map(func => 
        `    public fun ${func}() {\n        // TODO: Implement ${func}\n    }\n`
      ).join('\n');
      
      code = code.replace('    // Add your functions here', functions);
    }
    
    // Add custom structs
    if (customizations.structs.length > 0) {
      const structs = customizations.structs.map(struct => 
        `    struct ${struct} has key {\n        // TODO: Define ${struct} fields\n    }\n`
      ).join('\n');
      
      code = structs + '\n' + code;
    }
    
    return code;
  }

  generateCustomTests(customizations) {
    let tests = this.getBasicTestModule();
    
    if (customizations.functions.length > 0) {
      const testFunctions = customizations.functions.map(func => 
        `    #[test]\n    fun test_${func}() {\n        // TODO: Test ${func}\n    }\n`
      ).join('\n');
      
      tests = tests.replace('    // Add test functions here', testFunctions);
    }
    
    return tests;
  }

  generateSuggestions(customizations) {
    const suggestions = [
      'Consider adding error handling for edge cases',
      'Implement access control for sensitive functions',
      'Add events for important state changes',
      'Consider gas optimization for loops',
      'Add comprehensive documentation'
    ];

    if (customizations.functions.length > 5) {
      suggestions.push('Consider breaking down large contracts into modules');
    }

    return suggestions;
  }

  generateDocumentation(customizations) {
    return `# Contract Documentation

## Overview
This contract implements the specified functionality with the following features:

## Functions
${customizations.functions.map(func => `- ${func}(): TODO - Document this function`).join('\n')}

## Structs
${customizations.structs.map(struct => `- ${struct}: TODO - Document this struct`).join('\n')}

## Usage
TODO: Add usage examples

## Security Considerations
TODO: Document security considerations
`;
  }

  async generateTestFiles(templateType, projectName) {
    const tests = {};
    
    switch (templateType) {
      case 'basic':
        tests['basic_test.move'] = this.getBasicTestModule();
        break;
      case 'nft':
        tests['nft_test.move'] = this.getNFTTestModule();
        tests['marketplace_test.move'] = this.getMarketplaceTestModule();
        break;
      case 'defi':
        tests['pool_test.move'] = this.getPoolTestModule();
        tests['token_test.move'] = this.getTokenTestModule();
        break;
      case 'game':
        tests['game_test.move'] = this.getGameTestModule();
        tests['player_test.move'] = this.getPlayerTestModule();
        break;
      case 'dao':
        tests['dao_test.move'] = this.getDAOTestModule();
        tests['proposal_test.move'] = this.getProposalTestModule();
        break;
    }
    
    return tests;
  }

  processTemplate(template, variables) {
    let processed = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value);
    }
    
    return processed;
  }

  getProjectStructure(files) {
    return files.map(file => `  ${file}`).join('\n');
  }

  // Template content methods
  getProjectToml() {
    return `[package]
name = "{{projectName}}"
version = "0.1.0"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
{{projectName}} = "0x0"
`;
  }

  getBasicModule() {
    return `module {{projectName}}::main {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    // Error codes
    const ENotImplemented: u64 = 0;

    // Main struct
    struct MainObject has key, store {
        id: UID,
        value: u64,
    }

    // Events
    struct ObjectCreated has copy, drop {
        id: ID,
        value: u64,
    }

    // Initialize function
    fun init(_ctx: &mut TxContext) {
        // Initialization logic here
    }

    // Create new object
    public entry fun create_object(value: u64, ctx: &mut TxContext) {
        let id = object::new(ctx);
        let obj = MainObject {
            id,
            value,
        };
        
        sui::event::emit(ObjectCreated {
            id: object::uid_to_inner(&obj.id),
            value,
        });
        
        transfer::share_object(obj);
    }

    // Update object value
    public entry fun update_value(obj: &mut MainObject, new_value: u64) {
        obj.value = new_value;
    }

    // Get object value
    public fun get_value(obj: &MainObject): u64 {
        obj.value
    }

    // Add your functions here
}`;
  }

  getNFTModule() {
    return `module {{projectName}}::nft {
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::url::{Self, Url};
    use sui::event;

    // Error codes
    const ENotOwner: u64 = 0;
    const EInvalidTokenId: u64 = 1;

    // NFT Collection
    struct Collection has key, store {
        id: UID,
        name: String,
        description: String,
        creator: address,
        total_supply: u64,
    }

    // Individual NFT
    struct NFT has key, store {
        id: UID,
        collection_id: ID,
        token_id: u64,
        name: String,
        description: String,
        image_url: Url,
        attributes: vector<Attribute>,
    }

    struct Attribute has store, drop, copy {
        key: String,
        value: String,
    }

    // Events
    struct CollectionCreated has copy, drop {
        collection_id: ID,
        name: String,
        creator: address,
    }

    struct NFTMinted has copy, drop {
        nft_id: ID,
        collection_id: ID,
        token_id: u64,
        recipient: address,
    }

    // Create new collection
    public entry fun create_collection(
        name: vector<u8>,
        description: vector<u8>,
        ctx: &mut TxContext
    ) {
        let collection_id = object::new(ctx);
        let collection = Collection {
            id: collection_id,
            name: string::utf8(name),
            description: string::utf8(description),
            creator: tx_context::sender(ctx),
            total_supply: 0,
        };

        event::emit(CollectionCreated {
            collection_id: object::uid_to_inner(&collection.id),
            name: collection.name,
            creator: collection.creator,
        });

        transfer::share_object(collection);
    }

    // Mint NFT
    public entry fun mint_nft(
        collection: &mut Collection,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let nft_id = object::new(ctx);
        collection.total_supply = collection.total_supply + 1;
        
        let nft = NFT {
            id: nft_id,
            collection_id: object::uid_to_inner(&collection.id),
            token_id: collection.total_supply,
            name: string::utf8(name),
            description: string::utf8(description),
            image_url: url::new_unsafe_from_bytes(image_url),
            attributes: vector::empty(),
        };

        event::emit(NFTMinted {
            nft_id: object::uid_to_inner(&nft.id),
            collection_id: nft.collection_id,
            token_id: nft.token_id,
            recipient,
        });

        transfer::transfer(nft, recipient);
    }

    // Add attribute to NFT
    public entry fun add_attribute(
        nft: &mut NFT,
        key: vector<u8>,
        value: vector<u8>,
    ) {
        let attribute = Attribute {
            key: string::utf8(key),
            value: string::utf8(value),
        };
        vector::push_back(&mut nft.attributes, attribute);
    }

    // Getter functions
    public fun get_collection_info(collection: &Collection): (String, String, address, u64) {
        (collection.name, collection.description, collection.creator, collection.total_supply)
    }

    public fun get_nft_info(nft: &NFT): (u64, String, String, Url) {
        (nft.token_id, nft.name, nft.description, nft.image_url)
    }
}`;
  }

  getMarketplaceModule() {
    return `module {{projectName}}::marketplace {
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use {{projectName}}::nft::NFT;

    // Error codes
    const ENotOwner: u64 = 0;
    const EInsufficientPayment: u64 = 1;
    const EListingNotFound: u64 = 2;

    // Marketplace
    struct Marketplace has key {
        id: UID,
        listings: vector<Listing>,
    }

    // Listing for sale
    struct Listing has store {
        id: ID,
        nft_id: ID,
        seller: address,
        price: u64,
        is_active: bool,
    }

    // Events
    struct MarketplaceCreated has copy, drop {
        marketplace_id: ID,
    }

    struct NFTListed has copy, drop {
        nft_id: ID,
        seller: address,
        price: u64,
    }

    struct NFTSold has copy, drop {
        nft_id: ID,
        seller: address,
        buyer: address,
        price: u64,
    }

    // Initialize marketplace
    fun init(ctx: &mut TxContext) {
        let marketplace_id = object::new(ctx);
        let marketplace = Marketplace {
            id: marketplace_id,
            listings: vector::empty(),
        };

        event::emit(MarketplaceCreated {
            marketplace_id: object::uid_to_inner(&marketplace.id),
        });

        transfer::share_object(marketplace);
    }

    // List NFT for sale
    public entry fun list_nft(
        marketplace: &mut Marketplace,
        nft: NFT,
        price: u64,
        ctx: &mut TxContext
    ) {
        let nft_id = object::id(&nft);
        let listing_id = object::new(ctx);
        
        let listing = Listing {
            id: object::uid_to_inner(&listing_id),
            nft_id,
            seller: tx_context::sender(ctx),
            price,
            is_active: true,
        };

        vector::push_back(&mut marketplace.listings, listing);
        
        event::emit(NFTListed {
            nft_id,
            seller: tx_context::sender(ctx),
            price,
        });

        // Transfer NFT to marketplace (escrow)
        transfer::transfer(nft, @{{projectName}});
        object::delete(listing_id);
    }

    // Buy NFT
    public entry fun buy_nft(
        marketplace: &mut Marketplace,
        listing_id: ID,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let buyer = tx_context::sender(ctx);
        let (listing_index, listing) = find_listing(marketplace, listing_id);
        
        assert!(listing.is_active, EListingNotFound);
        assert!(coin::value(&payment) >= listing.price, EInsufficientPayment);

        // Mark listing as inactive
        let listing_mut = vector::borrow_mut(&mut marketplace.listings, listing_index);
        listing_mut.is_active = false;

        // Transfer payment to seller
        transfer::public_transfer(payment, listing.seller);

        event::emit(NFTSold {
            nft_id: listing.nft_id,
            seller: listing.seller,
            buyer,
            price: listing.price,
        });

        // In a real implementation, we'd transfer the NFT from escrow to buyer
        // This requires more sophisticated escrow mechanisms
    }

    // Helper function to find listing
    fun find_listing(marketplace: &Marketplace, listing_id: ID): (u64, Listing) {
        let i = 0;
        let len = vector::length(&marketplace.listings);
        
        while (i < len) {
            let listing = vector::borrow(&marketplace.listings, i);
            if (listing.id == listing_id) {
                return (i, *listing)
            };
            i = i + 1;
        };
        
        abort EListingNotFound
    }

    // Get active listings
    public fun get_active_listings(marketplace: &Marketplace): vector<Listing> {
        let active_listings = vector::empty<Listing>();
        let i = 0;
        let len = vector::length(&marketplace.listings);
        
        while (i < len) {
            let listing = vector::borrow(&marketplace.listings, i);
            if (listing.is_active) {
                vector::push_back(&mut active_listings, *listing);
            };
            i = i + 1;
        };
        
        active_listings
    }
}`;
  }

  getDeFiPoolModule() {
    return `module {{projectName}}::pool {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::math;
    use sui::event;

    // Error codes
    const EInsufficientLiquidity: u64 = 0;
    const EInvalidAmount: u64 = 1;
    const ESlippageTooHigh: u64 = 2;

    // Liquidity Pool
    struct LiquidityPool<phantom CoinA, phantom CoinB> has key {
        id: UID,
        reserve_a: Balance<CoinA>,
        reserve_b: Balance<CoinB>,
        lp_supply: u64,
        fee_rate: u64, // Fee in basis points (e.g., 30 = 0.3%)
    }

    // LP Token
    struct LPToken<phantom CoinA, phantom CoinB> has key, store {
        id: UID,
        pool_id: ID,
        amount: u64,
    }

    // Events
    struct PoolCreated<phantom CoinA, phantom CoinB> has copy, drop {
        pool_id: ID,
    }

    struct LiquidityAdded<phantom CoinA, phantom CoinB> has copy, drop {
        pool_id: ID,
        provider: address,
        amount_a: u64,
        amount_b: u64,
        lp_tokens: u64,
    }

    struct TokenSwapped<phantom CoinA, phantom CoinB> has copy, drop {
        pool_id: ID,
        trader: address,
        amount_in: u64,
        amount_out: u64,
        is_a_to_b: bool,
    }

    // Create new liquidity pool
    public entry fun create_pool<CoinA, CoinB>(
        coin_a: Coin<CoinA>,
        coin_b: Coin<CoinB>,
        ctx: &mut TxContext
    ) {
        let pool_id = object::new(ctx);
        let amount_a = coin::value(&coin_a);
        let amount_b = coin::value(&coin_b);
        
        assert!(amount_a > 0 && amount_b > 0, EInvalidAmount);

        let pool = LiquidityPool<CoinA, CoinB> {
            id: pool_id,
            reserve_a: coin::into_balance(coin_a),
            reserve_b: coin::into_balance(coin_b),
            lp_supply: math::sqrt(amount_a * amount_b),
            fee_rate: 30, // 0.3% fee
        };

        event::emit(PoolCreated<CoinA, CoinB> {
            pool_id: object::uid_to_inner(&pool.id),
        });

        transfer::share_object(pool);
    }

    // Add liquidity to pool
    public entry fun add_liquidity<CoinA, CoinB>(
        pool: &mut LiquidityPool<CoinA, CoinB>,
        coin_a: Coin<CoinA>,
        coin_b: Coin<CoinB>,
        ctx: &mut TxContext
    ) {
        let amount_a = coin::value(&coin_a);
        let amount_b = coin::value(&coin_b);
        let reserve_a = balance::value(&pool.reserve_a);
        let reserve_b = balance::value(&pool.reserve_b);

        // Calculate optimal amounts based on current reserves
        let optimal_b = amount_a * reserve_b / reserve_a;
        assert!(amount_b >= optimal_b, EInvalidAmount);

        // Add liquidity
        balance::join(&mut pool.reserve_a, coin::into_balance(coin_a));
        balance::join(&mut pool.reserve_b, coin::into_balance(coin_b));

        // Calculate LP tokens to mint
        let lp_tokens = if (pool.lp_supply == 0) {
            math::sqrt(amount_a * amount_b)
        } else {
            math::min(
                amount_a * pool.lp_supply / reserve_a,
                amount_b * pool.lp_supply / reserve_b
            )
        };

        pool.lp_supply = pool.lp_supply + lp_tokens;

        // Mint LP token
        let lp_token = LPToken<CoinA, CoinB> {
            id: object::new(ctx),
            pool_id: object::uid_to_inner(&pool.id),
            amount: lp_tokens,
        };

        event::emit(LiquidityAdded<CoinA, CoinB> {
            pool_id: object::uid_to_inner(&pool.id),
            provider: tx_context::sender(ctx),
            amount_a,
            amount_b,
            lp_tokens,
        });

        transfer::transfer(lp_token, tx_context::sender(ctx));
    }

    // Swap tokens
    public entry fun swap_a_to_b<CoinA, CoinB>(
        pool: &mut LiquidityPool<CoinA, CoinB>,
        coin_a: Coin<CoinA>,
        min_amount_out: u64,
        ctx: &mut TxContext
    ) {
        let amount_in = coin::value(&coin_a);
        let reserve_a = balance::value(&pool.reserve_a);
        let reserve_b = balance::value(&pool.reserve_b);

        // Calculate amount out using constant product formula with fees
        let amount_in_with_fee = amount_in * (10000 - pool.fee_rate) / 10000;
        let amount_out = (amount_in_with_fee * reserve_b) / (reserve_a + amount_in_with_fee);

        assert!(amount_out >= min_amount_out, ESlippageTooHigh);
        assert!(amount_out < reserve_b, EInsufficientLiquidity);

        // Execute swap
        balance::join(&mut pool.reserve_a, coin::into_balance(coin_a));
        let coin_out = coin::from_balance(
            balance::split(&mut pool.reserve_b, amount_out),
            ctx
        );

        event::emit(TokenSwapped<CoinA, CoinB> {
            pool_id: object::uid_to_inner(&pool.id),
            trader: tx_context::sender(ctx),
            amount_in,
            amount_out,
            is_a_to_b: true,
        });

        transfer::public_transfer(coin_out, tx_context::sender(ctx));
    }

    // Get pool reserves
    public fun get_reserves<CoinA, CoinB>(
        pool: &LiquidityPool<CoinA, CoinB>
    ): (u64, u64) {
        (balance::value(&pool.reserve_a), balance::value(&pool.reserve_b))
    }

    // Calculate swap output
    public fun calculate_swap_output<CoinA, CoinB>(
        pool: &LiquidityPool<CoinA, CoinB>,
        amount_in: u64,
        is_a_to_b: bool
    ): u64 {
        let (reserve_in, reserve_out) = if (is_a_to_b) {
            (balance::value(&pool.reserve_a), balance::value(&pool.reserve_b))
        } else {
            (balance::value(&pool.reserve_b), balance::value(&pool.reserve_a))
        };

        let amount_in_with_fee = amount_in * (10000 - pool.fee_rate) / 10000;
        (amount_in_with_fee * reserve_out) / (reserve_in + amount_in_with_fee)
    }
}`;
  }

  getTokenModule() {
    return `module {{projectName}}::token {
    use sui::object::UID;
    use sui::transfer;
    use sui::tx_context::TxContext;
    use sui::coin::{Self, TreasuryCap, CoinMetadata};
    use std::string;

    // Token struct
    struct TOKEN has drop {}

    // Initialize token
    fun init(witness: TOKEN, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency<TOKEN>(
            witness,
            9, // decimals
            b"TKN", // symbol
            b"Project Token", // name
            b"A custom token for the project", // description
            option::none(), // icon_url
            ctx
        );

        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    // Mint tokens
    public entry fun mint(
        treasury_cap: &mut TreasuryCap<TOKEN>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }

    // Burn tokens
    public entry fun burn(
        treasury_cap: &mut TreasuryCap<TOKEN>,
        coin: coin::Coin<TOKEN>
    ) {
        coin::burn(treasury_cap, coin);
    }
}`;
  }

  getGameModule() {
    return `module {{projectName}}::game {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use {{projectName}}::player::Player;

    // Error codes
    const EGameNotActive: u64 = 0;
    const EPlayerNotFound: u64 = 1;
    const EInvalidMove: u64 = 2;

    // Game state
    struct Game has key {
        id: UID,
        name: String,
        is_active: bool,
        max_players: u64,
        current_players: u64,
        winner: Option<address>,
    }

    // Events
    struct GameCreated has copy, drop {
        game_id: ID,
        name: String,
    }

    struct PlayerJoined has copy, drop {
        game_id: ID,
        player: address,
    }

    struct GameEnded has copy, drop {
        game_id: ID,
        winner: address,
    }

    // Create new game
    public entry fun create_game(
        name: vector<u8>,
        max_players: u64,
        ctx: &mut TxContext
    ) {
        let game_id = object::new(ctx);
        let game = Game {
            id: game_id,
            name: string::utf8(name),
            is_active: true,
            max_players,
            current_players: 0,
            winner: option::none(),
        };

        event::emit(GameCreated {
            game_id: object::uid_to_inner(&game.id),
            name: game.name,
        });

        transfer::share_object(game);
    }

    // Join game
    public entry fun join_game(
        game: &mut Game,
        player: &mut Player,
        ctx: &mut TxContext
    ) {
        assert!(game.is_active, EGameNotActive);
        assert!(game.current_players < game.max_players, EInvalidMove);

        game.current_players = game.current_players + 1;

        event::emit(PlayerJoined {
            game_id: object::uid_to_inner(&game.id),
            player: tx_context::sender(ctx),
        });
    }

    // End game
    public entry fun end_game(
        game: &mut Game,
        winner: address,
        _ctx: &mut TxContext
    ) {
        assert!(game.is_active, EGameNotActive);
        
        game.is_active = false;
        game.winner = option::some(winner);

        event::emit(GameEnded {
            game_id: object::uid_to_inner(&game.id),
            winner,
        });
    }

    // Get game info
    public fun get_game_info(game: &Game): (String, bool, u64, u64, Option<address>) {
        (game.name, game.is_active, game.max_players, game.current_players, game.winner)
    }
}`;
  }

  getPlayerModule() {
    return `module {{projectName}}::player {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};

    // Player profile
    struct Player has key, store {
        id: UID,
        name: String,
        level: u64,
        experience: u64,
        wins: u64,
        losses: u64,
    }

    // Create player profile
    public entry fun create_player(
        name: vector<u8>,
        ctx: &mut TxContext
    ) {
        let player = Player {
            id: object::new(ctx),
            name: string::utf8(name),
            level: 1,
            experience: 0,
            wins: 0,
            losses: 0,
        };

        transfer::transfer(player, tx_context::sender(ctx));
    }

    // Add experience
    public entry fun add_experience(
        player: &mut Player,
        exp: u64
    ) {
        player.experience = player.experience + exp;
        
        // Level up logic
        let new_level = player.experience / 100 + 1;
        if (new_level > player.level) {
            player.level = new_level;
        };
    }

    // Record win
    public entry fun record_win(player: &mut Player) {
        player.wins = player.wins + 1;
        add_experience(player, 50);
    }

    // Record loss
    public entry fun record_loss(player: &mut Player) {
        player.losses = player.losses + 1;
        add_experience(player, 10);
    }

    // Get player stats
    public fun get_stats(player: &Player): (String, u64, u64, u64, u64) {
        (player.name, player.level, player.experience, player.wins, player.losses)
    }
}`;
  }

  getDAOModule() {
    return `module {{projectName}}::dao {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use std::string::String;
    use sui::event;

    // Error codes
    const ENotMember: u64 = 0;
    const EInsufficientTokens: u64 = 1;
    const EProposalNotActive: u64 = 2;

    // DAO structure
    struct DAO<phantom GovernanceToken> has key {
        id: UID,
        name: String,
        description: String,
        treasury: Balance<GovernanceToken>,
        members: vector<address>,
        proposal_count: u64,
        min_proposal_threshold: u64,
    }

    // Membership token
    struct MembershipNFT has key, store {
        id: UID,
        dao_id: ID,
        member: address,
        voting_power: u64,
        joined_at: u64,
    }

    // Events
    struct DAOCreated has copy, drop {
        dao_id: ID,
        name: String,
        creator: address,
    }

    struct MemberJoined has copy, drop {
        dao_id: ID,
        member: address,
        voting_power: u64,
    }

    // Create DAO
    public entry fun create_dao<GovernanceToken>(
        name: vector<u8>,
        description: vector<u8>,
        initial_treasury: Coin<GovernanceToken>,
        min_proposal_threshold: u64,
        ctx: &mut TxContext
    ) {
        let dao_id = object::new(ctx);
        let dao = DAO<GovernanceToken> {
            id: dao_id,
            name: string::utf8(name),
            description: string::utf8(description),
            treasury: coin::into_balance(initial_treasury),
            members: vector::empty(),
            proposal_count: 0,
            min_proposal_threshold,
        };

        event::emit(DAOCreated {
            dao_id: object::uid_to_inner(&dao.id),
            name: dao.name,
            creator: tx_context::sender(ctx),
        });

        transfer::share_object(dao);
    }

    // Join DAO
    public entry fun join_dao<GovernanceToken>(
        dao: &mut DAO<GovernanceToken>,
        membership_fee: Coin<GovernanceToken>,
        ctx: &mut TxContext
    ) {
        let member = tx_context::sender(ctx);
        let voting_power = coin::value(&membership_fee);
        
        // Add to treasury
        balance::join(&mut dao.treasury, coin::into_balance(membership_fee));
        
        // Add to members
        vector::push_back(&mut dao.members, member);

        // Create membership NFT
        let membership = MembershipNFT {
            id: object::new(ctx),
            dao_id: object::uid_to_inner(&dao.id),
            member,
            voting_power,
            joined_at: tx_context::epoch(ctx),
        };

        event::emit(MemberJoined {
            dao_id: object::uid_to_inner(&dao.id),
            member,
            voting_power,
        });

        transfer::transfer(membership, member);
    }

    // Check if address is member
    public fun is_member<GovernanceToken>(dao: &DAO<GovernanceToken>, addr: address): bool {
        vector::contains(&dao.members, &addr)
    }

    // Get DAO info
    public fun get_dao_info<GovernanceToken>(
        dao: &DAO<GovernanceToken>
    ): (String, String, u64, u64, u64) {
        (
            dao.name,
            dao.description,
            balance::value(&dao.treasury),
            vector::length(&dao.members),
            dao.proposal_count
        )
    }
}`;
  }

  getProposalModule() {
    return `module {{projectName}}::proposal {
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::event;
    use {{projectName}}::dao::DAO;

    // Proposal states
    const PROPOSAL_ACTIVE: u8 = 0;
    const PROPOSAL_PASSED: u8 = 1;
    const PROPOSAL_REJECTED: u8 = 2;
    const PROPOSAL_EXECUTED: u8 = 3;

    // Error codes
    const ENotMember: u64 = 0;
    const EProposalNotActive: u64 = 1;
    const EAlreadyVoted: u64 = 2;

    // Proposal structure
    struct Proposal has key, store {
        id: UID,
        dao_id: ID,
        proposer: address,
        title: String,
        description: String,
        votes_for: u64,
        votes_against: u64,
        status: u8,
        end_time: u64,
        voters: vector<address>,
    }

    // Events
    struct ProposalCreated has copy, drop {
        proposal_id: ID,
        dao_id: ID,
        proposer: address,
        title: String,
    }

    struct VoteCast has copy, drop {
        proposal_id: ID,
        voter: address,
        vote: bool,
        power: u64,
    }

    struct ProposalExecuted has copy, drop {
        proposal_id: ID,
        result: bool,
    }

    // Create proposal
    public entry fun create_proposal<GovernanceToken>(
        dao: &DAO<GovernanceToken>,
        title: vector<u8>,
        description: vector<u8>,
        voting_duration: u64,
        ctx: &mut TxContext
    ) {
        let proposer = tx_context::sender(ctx);
        assert!({{projectName}}::dao::is_member(dao, proposer), ENotMember);

        let proposal_id = object::new(ctx);
        let proposal = Proposal {
            id: proposal_id,
            dao_id: object::id(dao),
            proposer,
            title: string::utf8(title),
            description: string::utf8(description),
            votes_for: 0,
            votes_against: 0,
            status: PROPOSAL_ACTIVE,
            end_time: tx_context::epoch(ctx) + voting_duration,
            voters: vector::empty(),
        };

        event::emit(ProposalCreated {
            proposal_id: object::uid_to_inner(&proposal.id),
            dao_id: proposal.dao_id,
            proposer,
            title: proposal.title,
        });

        transfer::share_object(proposal);
    }

    // Cast vote
    public entry fun vote<GovernanceToken>(
        dao: &DAO<GovernanceToken>,
        proposal: &mut Proposal,
        vote: bool,
        voting_power: u64,
        ctx: &mut TxContext
    ) {
        let voter = tx_context::sender(ctx);
        assert!({{projectName}}::dao::is_member(dao, voter), ENotMember);
        assert!(proposal.status == PROPOSAL_ACTIVE, EProposalNotActive);
        assert!(!vector::contains(&proposal.voters, &voter), EAlreadyVoted);
        assert!(tx_context::epoch(ctx) < proposal.end_time, EProposalNotActive);

        // Record vote
        vector::push_back(&mut proposal.voters, voter);
        
        if (vote) {
            proposal.votes_for = proposal.votes_for + voting_power;
        } else {
            proposal.votes_against = proposal.votes_against + voting_power;
        };

        event::emit(VoteCast {
            proposal_id: object::uid_to_inner(&proposal.id),
            voter,
            vote,
            power: voting_power,
        });
    }

    // Execute proposal
    public entry fun execute_proposal(
        proposal: &mut Proposal,
        ctx: &mut TxContext
    ) {
        assert!(proposal.status == PROPOSAL_ACTIVE, EProposalNotActive);
        assert!(tx_context::epoch(ctx) >= proposal.end_time, EProposalNotActive);

        // Determine result
        let passed = proposal.votes_for > proposal.votes_against;
        proposal.status = if (passed) PROPOSAL_PASSED else PROPOSAL_REJECTED;

        event::emit(ProposalExecuted {
            proposal_id: object::uid_to_inner(&proposal.id),
            result: passed,
        });
    }

    // Get proposal info
    public fun get_proposal_info(proposal: &Proposal): (String, String, u64, u64, u8, u64) {
        (
            proposal.title,
            proposal.description,
            proposal.votes_for,
            proposal.votes_against,
            proposal.status,
            proposal.end_time
        )
    }
}`;
  }

  getVotingModule() {
    return `module {{projectName}}::voting {
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;

    // Voting mechanisms
    struct QuadraticVoting has store {
        total_tokens_used: u64,
        vote_count: u64,
    }

    struct WeightedVoting has store {
        total_weight: u64,
        weighted_votes_for: u64,
        weighted_votes_against: u64,
    }

    // Vote record
    struct VoteRecord has key, store {
        id: UID,
        proposal_id: ID,
        voter: address,
        vote_type: u8,
        power_used: u64,
        timestamp: u64,
    }

    // Cast quadratic vote
    public entry fun cast_quadratic_vote(
        proposal_id: ID,
        tokens_to_spend: u64,
        vote: bool,
        ctx: &mut TxContext
    ) {
        let vote_power = sqrt(tokens_to_spend);
        
        let vote_record = VoteRecord {
            id: object::new(ctx),
            proposal_id,
            voter: tx_context::sender(ctx),
            vote_type: if (vote) 1 else 0,
            power_used: vote_power,
            timestamp: tx_context::epoch(ctx),
        };

        transfer::transfer(vote_record, tx_context::sender(ctx));
    }

    // Helper function for square root (simplified)
    fun sqrt(x: u64): u64 {
        if (x == 0) return 0;
        let z = (x + 1) / 2;
        let y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        };
        y
    }
}`;
  }

  // Test module templates
  getBasicTestModule() {
    return `#[test_only]
module {{projectName}}::main_tests {
    use {{projectName}}::main;
    use sui::test_scenario::{Self, Scenario};

    #[test]
    fun test_create_object() {
        let admin = @0xAD;
        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;

        // Create object
        {
            main::create_object(42, test_scenario::ctx(scenario));
        };

        // Check object was created
        test_scenario::next_tx(scenario, admin);
        {
            assert!(test_scenario::has_most_recent_shared<main::MainObject>(), 0);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_update_value() {
        let admin = @0xAD;
        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;

        // Create and update object
        {
            main::create_object(42, test_scenario::ctx(scenario));
        };

        test_scenario::next_tx(scenario, admin);
        {
            let obj = test_scenario::take_shared<main::MainObject>(scenario);
            main::update_value(&mut obj, 100);
            assert!(main::get_value(&obj) == 100, 0);
            test_scenario::return_shared(obj);
        };

        test_scenario::end(scenario_val);
    }

    // Add test functions here
}`;
  }

  getNFTTestModule() {
    return `#[test_only]
module {{projectName}}::nft_tests {
    use {{projectName}}::nft;
    use sui::test_scenario::{Self, Scenario};

    #[test]
    fun test_create_collection() {
        let creator = @0xCREATE;
        let scenario_val = test_scenario::begin(creator);
        let scenario = &mut scenario_val;

        // Create collection
        {
            nft::create_collection(
                b"Test Collection",
                b"A test NFT collection",
                test_scenario::ctx(scenario)
            );
        };

        // Verify collection exists
        test_scenario::next_tx(scenario, creator);
        {
            assert!(test_scenario::has_most_recent_shared<nft::Collection>(), 0);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_mint_nft() {
        let creator = @0xCREATE;
        let recipient = @0xRECIP;
        let scenario_val = test_scenario::begin(creator);
        let scenario = &mut scenario_val;

        // Create collection and mint NFT
        {
            nft::create_collection(
                b"Test Collection",
                b"A test NFT collection",
                test_scenario::ctx(scenario)
            );
        };

        test_scenario::next_tx(scenario, creator);
        {
            let collection = test_scenario::take_shared<nft::Collection>(scenario);
            nft::mint_nft(
                &mut collection,
                b"Test NFT",
                b"A test NFT",
                b"https://example.com/image.png",
                recipient,
                test_scenario::ctx(scenario)
            );
            test_scenario::return_shared(collection);
        };

        // Verify NFT was minted to recipient
        test_scenario::next_tx(scenario, recipient);
        {
            assert!(test_scenario::has_most_recent_for_sender<nft::NFT>(scenario), 0);
        };

        test_scenario::end(scenario_val);
    }
}`;
  }

  getMarketplaceTestModule() {
    return `#[test_only]
module {{projectName}}::marketplace_tests {
    use {{projectName}}::marketplace;
    use {{projectName}}::nft;
    use sui::test_scenario;
    use sui::coin;
    use sui::sui::SUI;

    #[test]
    fun test_marketplace_creation() {
        let admin = @0xAD;
        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;

        // Marketplace should be created in init
        test_scenario::next_tx(scenario, admin);
        {
            assert!(test_scenario::has_most_recent_shared<marketplace::Marketplace>(), 0);
        };

        test_scenario::end(scenario_val);
    }
}`;
  }

  getPoolTestModule() {
    return `#[test_only]
module {{projectName}}::pool_tests {
    use {{projectName}}::pool;
    use sui::test_scenario;
    use sui::coin;

    struct COIN_A has drop {}
    struct COIN_B has drop {}

    #[test]
    fun test_create_pool() {
        let admin = @0xAD;
        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;

        // Create coins for testing
        {
            let coin_a = coin::mint_for_testing<COIN_A>(1000, test_scenario::ctx(scenario));
            let coin_b = coin::mint_for_testing<COIN_B>(2000, test_scenario::ctx(scenario));
            
            pool::create_pool(coin_a, coin_b, test_scenario::ctx(scenario));
        };

        test_scenario::next_tx(scenario, admin);
        {
            assert!(test_scenario::has_most_recent_shared<pool::LiquidityPool<COIN_A, COIN_B>>(), 0);
        };

        test_scenario::end(scenario_val);
    }
}`;
  }

  getTokenTestModule() {
    return `#[test_only]
module {{projectName}}::token_tests {
    use {{projectName}}::token::{Self, TOKEN};
    use sui::test_scenario;
    use sui::coin;

    #[test]
    fun test_token_creation() {
        let admin = @0xAD;
        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;

        // Token should be created in init
        test_scenario::next_tx(scenario, admin);
        {
            assert!(test_scenario::has_most_recent_for_sender<coin::TreasuryCap<TOKEN>>(scenario), 0);
        };

        test_scenario::end(scenario_val);
    }
}`;
  }

  getGameTestModule() {
    return `#[test_only]
module {{projectName}}::game_tests {
    use {{projectName}}::game;
    use {{projectName}}::player;
    use sui::test_scenario;

    #[test]
    fun test_create_game() {
        let admin = @0xAD;
        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;

        {
            game::create_game(b"Test Game", 4, test_scenario::ctx(scenario));
        };

        test_scenario::next_tx(scenario, admin);
        {
            assert!(test_scenario::has_most_recent_shared<game::Game>(), 0);
        };

        test_scenario::end(scenario_val);
    }
}`;
  }

  getPlayerTestModule() {
    return `#[test_only]
module {{projectName}}::player_tests {
    use {{projectName}}::player;
    use sui::test_scenario;

    #[test]
    fun test_create_player() {
        let user = @0xUSER;
        let scenario_val = test_scenario::begin(user);
        let scenario = &mut scenario_val;

        {
            player::create_player(b"Test Player", test_scenario::ctx(scenario));
        };

        test_scenario::next_tx(scenario, user);
        {
            assert!(test_scenario::has_most_recent_for_sender<player::Player>(scenario), 0);
        };

        test_scenario::end(scenario_val);
    }
}`;
  }

  getDAOTestModule() {
    return `#[test_only]
module {{projectName}}::dao_tests {
    use {{projectName}}::dao;
    use sui::test_scenario;
    use sui::coin;

    struct GOV_TOKEN has drop {}

    #[test]
    fun test_create_dao() {
        let creator = @0xCREATE;
        let scenario_val = test_scenario::begin(creator);
        let scenario = &mut scenario_val;

        {
            let treasury = coin::mint_for_testing<GOV_TOKEN>(10000, test_scenario::ctx(scenario));
            dao::create_dao(
                b"Test DAO",
                b"A test DAO",
                treasury,
                100,
                test_scenario::ctx(scenario)
            );
        };

        test_scenario::next_tx(scenario, creator);
        {
            assert!(test_scenario::has_most_recent_shared<dao::DAO<GOV_TOKEN>>(), 0);
        };

        test_scenario::end(scenario_val);
    }
}`;
  }

  getProposalTestModule() {
    return `#[test_only]
module {{projectName}}::proposal_tests {
    use {{projectName}}::proposal;
    use {{projectName}}::dao;
    use sui::test_scenario;
    use sui::coin;

    struct GOV_TOKEN has drop {}

    #[test]
    fun test_create_proposal() {
        let creator = @0xCREATE;
        let scenario_val = test_scenario::begin(creator);
        let scenario = &mut scenario_val;

        // Create DAO first
        {
            let treasury = coin::mint_for_testing<GOV_TOKEN>(10000, test_scenario::ctx(scenario));
            dao::create_dao(
                b"Test DAO",
                b"A test DAO",
                treasury,
                100,
                test_scenario::ctx(scenario)
            );
        };

        // Join DAO
        test_scenario::next_tx(scenario, creator);
        {
            let dao_obj = test_scenario::take_shared<dao::DAO<GOV_TOKEN>>(scenario);
            let membership_fee = coin::mint_for_testing<GOV_TOKEN>(1000, test_scenario::ctx(scenario));
            dao::join_dao(&mut dao_obj, membership_fee, test_scenario::ctx(scenario));
            test_scenario::return_shared(dao_obj);
        };

        // Create proposal
        test_scenario::next_tx(scenario, creator);
        {
            let dao_obj = test_scenario::take_shared<dao::DAO<GOV_TOKEN>>(scenario);
            proposal::create_proposal(
                &dao_obj,
                b"Test Proposal",
                b"A test proposal",
                100, // voting duration
                test_scenario::ctx(scenario)
            );
            test_scenario::return_shared(dao_obj);
        };

        test_scenario::next_tx(scenario, creator);
        {
            assert!(test_scenario::has_most_recent_shared<proposal::Proposal>(), 0);
        };

        test_scenario::end(scenario_val);
    }
}`;
  }

  // List available templates
  getAvailableTemplates() {
    return Array.from(this.templates.entries()).map(([key, template]) => ({
      id: key,
      name: template.name,
      description: template.description
    }));
  }

  // Template customization helpers
  addCustomField(template, structName, fieldName, fieldType) {
    // Add custom field to struct definition
    return template.replace(
      `struct ${structName} {`,
      `struct ${structName} {\n        ${fieldName}: ${fieldType},`
    );
  }

  addCustomFunction(template, functionName, parameters, returnType, body) {
    // Add custom function to module
    const functionDef = `
    public fun ${functionName}(${parameters}): ${returnType} {
        ${body}
    }`;
    
    return template.replace('    // Add your functions here', functionDef);
  }
}