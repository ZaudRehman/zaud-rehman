export const bloomcraft = {
  // ========== HEADER ==========
  title: "BloomCraft",
  subtitle: "Production Bloom Filter Library",
  tagline: "Comprehensive probabilistic data structures library in Rust with 11+ filter variants, pluggable hash system, and SIMD acceleration",
  
  // ========== CORE HIGHLIGHTS ==========
  highlights: [
    "11+ production-grade filter variants covering every real-world use case (standard, counting, scalable, sharded, tree-based)",
    "Pluggable hash system: XXHash3, WyHash, SipHash, and SIMD vectorization for batch operations",
    "Enhanced Double Hashing reducing hash computations by 70% (Kirsch-Mitzenmacher 2006)",
    "Register-blocked memory layout for optimal cache performance",
    "Lock-free concurrent filters with multiple concurrency patterns",
    "Always-on zero-overhead statistics using relaxed atomic operations"
  ],

  // ========== ARCHITECTURE ==========
  architecture: {
    
    // --- CORE FILTER VARIANTS ---
    core_filters: [
      {
        name: "StandardBloomFilter",
        category: "Core",
        description: "Classic implementation with enhanced double hashing, optimal parameter calculation, and always-on statistics",
        features: [
          "Lock-free concurrent insert/query",
          "Always-on statistics (zero overhead)",
          "Adaptive k selection",
          "CPU prefetch optimization for batch operations"
        ],
        use_case: "General-purpose low-memory sets",
        file: "standard.rs"
      },
      {
        name: "RegisterBlockedBloomFilter",
        category: "Performance",
        description: "Cache-optimized variant using 64-byte register blocks aligned to L1 cache lines",
        features: [
          "All k hash lookups in single cache line",
          "NUMA-aware memory layout",
          "Automatic selection for high-k scenarios"
        ],
        use_case: "High-throughput latency-sensitive systems",
        file: "register_blocked.rs"
      },
      {
        name: "CountingBloomFilter",
        category: "Deletable",
        description: "Supports deletions via configurable atomic counters (4/8/16-bit) with overflow protection",
        features: [
          "Thread-safe insert/delete/query",
          "Configurable counter width (4/8/16-bit)",
          "Overflow detection and prevention",
          "Decrement-safe with underflow checks"
        ],
        use_case: "Dynamic sets requiring remove operations (caches, session stores, TTL data)",
        file: "counting.rs"
      },
      {
        name: "ScalableBloomFilter",
        category: "Adaptive",
        description: "Auto-growing series of filters with exponentially tightening false positive rates",
        features: [
          "Unbounded capacity (no rebuild required)",
          "Automatic growth at 80% load",
          "FPR tightening per layer",
          "Efficient multi-filter union/intersect"
        ],
        use_case: "Unbounded data streams (event processing, log ingestion, analytics)",
        file: "scalable.rs"
      }
    ],

    // --- CONCURRENT FILTER VARIANTS ---
    concurrent_filters: [
      {
        name: "ShardedBloomFilter",
        category: "Concurrent",
        description: "N-way sharded filter partitioned by hash prefix for parallel multi-core access",
        features: [
          "Per-shard locking (reduced contention)",
          "Linear CPU scaling to 16+ cores",
          "Configurable shard count (power of 2)",
          "Cache-line-aligned shard metadata"
        ],
        use_case: "Multi-threaded servers (REST APIs, microservices, web backends)",
        file: "sharded.rs"
      },
      {
        name: "StripedBloomFilter",
        category: "Concurrent",
        description: "Fine-grained striped locking pattern for high-contention shared filter workloads",
        features: [
          "Stripe-level locks (multiple concurrent writers)",
          "Reduced lock contention vs single lock",
          "Cache-line padding to prevent false sharing",
          "Configurable stripe count"
        ],
        use_case: "High-contention shared filters with mixed read/write",
        file: "striped.rs"
      },
      {
        name: "AtomicPartitionedBloomFilter",
        category: "Concurrent",
        description: "Lock-free partitioned filter using atomic operations on independent NUMA-aware regions",
        features: [
          "Zero locks (pure atomic operations)",
          "NUMA-optimized memory allocation",
          "Thread-local partition affinity",
          "Automatic partition balancing"
        ],
        use_case: "NUMA systems, distributed caching, multi-socket servers",
        file: "atomic_partitioned.rs"
      }
    ],

    // --- SPECIALIZED FILTER VARIANTS ---
    specialized_filters: [
      {
        name: "PartitionedBloomFilter",
        category: "Distributed",
        description: "Multi-partition filter designed for distributed systems with consistent hashing",
        features: [
          "Consistent hashing for sharding",
          "Partition-level union/intersect operations",
          "Rebalancing support for adding nodes",
          "Cross-partition query optimization"
        ],
        use_case: "Distributed databases, CDN edge caches, sharded key-value stores",
        file: "partitioned.rs"
      },
      {
        name: "TreeBloomFilter",
        category: "Hierarchical",
        description: "Hierarchical tree structure enabling range queries and prefix matching",
        features: [
          "Range query support (time windows, key ranges)",
          "Prefix matching for hierarchical data",
          "Efficient subtree union/intersect",
          "Configurable branching factor"
        ],
        use_case: "Time-series data, log analysis with temporal queries, hierarchical keys",
        file: "tree.rs"
      },
      {
        name: "ClassicHashBloomFilter",
        category: "Reference",
        description: "Reference implementation using k truly independent hash functions",
        features: [
          "k independent hashes (academic standard)",
          "Maximum hash independence",
          "Benchmark baseline for comparisons",
          "Educational reference implementation"
        ],
        use_case: "Research, academic comparisons, benchmarking baseline",
        file: "classic_hash.rs"
      },
      {
        name: "ClassicBitsBloomFilter",
        category: "Reference",
        description: "Classic bit-array implementation with standard hashing (textbook algorithm)",
        features: [
          "Minimal memory overhead",
          "Standard textbook algorithm",
          "No advanced optimizations",
          "Maximum compatibility"
        ],
        use_case: "Compatibility mode, reference implementation, educational use",
        file: "classic_bits.rs"
      }
    ],

    // --- HASH SYSTEM ---
    hash_system: {
      overview: "Pluggable multi-algorithm hash system with SIMD acceleration and strategic optimizations",
      
      algorithms: [
        {
          name: "XXHash3",
          type: "Primary (Default)",
          description: "State-of-the-art non-cryptographic hash designed by Yann Collet",
          characteristics: [
            "Extremely fast on modern CPUs",
            "Excellent avalanche properties",
            "SIMD-optimized (AVX2/AVX-512)",
            "Minimal collision rate"
          ],
          use_case: "Default for maximum throughput in multi-core systems",
          file: "xxhash.rs"
        },
        {
          name: "WyHash",
          type: "Performance Alternative",
          description: "Fastest known non-cryptographic hash designed by Wang Yi",
          characteristics: [
            "Fastest single-core performance",
            "Ultra-low collision rate",
            "Simple 64-bit multiplication",
            "Minimal CPU instructions"
          ],
          use_case: "Low-latency single-threaded workloads",
          file: "wyhash.rs"
        },
        {
          name: "SipHash (StdHasher)",
          type: "Standard Library",
          description: "Rust standard library cryptographic hash (DoS-resistant)",
          characteristics: [
            "DoS-resistant (hash flooding protection)",
            "Cryptographically secure",
            "Stable across Rust versions",
            "No external dependencies"
          ],
          use_case: "Security-sensitive applications, reproducible builds",
          file: "hasher.rs"
        },
        {
          name: "SIMD Batch Hasher",
          type: "Batch Optimization",
          description: "AVX2/AVX-512 vectorized batch hashing processing 4-8 items simultaneously",
          characteristics: [
            "Processes 4-8 items in parallel",
            "x86_64 AVX2/AVX-512 only",
            "Automatic CPU feature detection",
            "Graceful fallback to scalar"
          ],
          use_case: "Batch insert/query operations, analytics workloads",
          file: "simd.rs"
        }
      ],

      strategies: [
        {
          name: "EnhancedDoubleHashing",
          algorithm: "Kirsch-Mitzenmacher optimization with entropy mixing",
          formula: "h_i(x) = (h1(x) + i × h2(x) + f(i³)) mod m",
          benefit: "Generates k indices from just 2 base hashes",
          research_paper: "Kirsch & Mitzenmacher (2006) - Less Hashing, Same Performance",
          implementation: "strategies.rs"
        },
        {
          name: "TripleHashing",
          algorithm: "Extended double hashing with nonlinear term",
          formula: "h_i(x) = h1 + i×h2 + ((i³ XOR constant) >> shift) mod m",
          benefit: "Eliminates clustering at high load factors",
          implementation: "strategies.rs"
        },
        {
          name: "ClassicHashing",
          algorithm: "k truly independent hash functions",
          formula: "h_i(x) = hash_i(x) mod m for i ∈ [0, k)",
          benefit: "Maximum hash independence (academic baseline)",
          use_case: "Benchmarking reference, research comparisons",
          implementation: "strategies.rs"
        }
      ]
    }
  },

  // ========== TECHNICAL INNOVATIONS ==========
  innovations: [
    {
      name: "Register Blocking",
      description: "Partitioned bit vector into 64-byte cache-line-aligned blocks ensuring all k hash lookups stay in L1 cache",
      technical_detail: "Each item maps to exactly one 512-bit block, all k indices computed within that block"
    },
    {
      name: "Enhanced Double Hashing",
      description: "Generate k indices from 2 base hashes using Kirsch-Mitzenmacher optimization with entropy mixing",
      technical_detail: "Reduces hash computations by 70% compared to k independent hashes"
    },
    {
      name: "Adaptive k Selection",
      description: "Dynamically reduce k as filter fills: k_adaptive = k × sqrt(1 - load) for load >30%",
      technical_detail: "Extends usable capacity range by 30-50% while maintaining target FPR"
    },
    {
      name: "SIMD Batch Hashing",
      description: "AVX2/AVX-512 vectorized hashing processing 4-8 items in parallel",
      technical_detail: "Automatic dispatch based on batch size and CPU features"
    },
    {
      name: "Lock-free Concurrent Patterns",
      description: "Atomic operations with Relaxed memory ordering for concurrent insert/query",
      technical_detail: "Sharded (per-partition locks), Striped (fine-grained), Atomic (pure lock-free)"
    },
    {
      name: "Hierarchical Tree Filter",
      description: "Tree structure enabling O(log n) range queries and prefix matching",
      technical_detail: "Enables time-series queries like 'items from last hour' without full scan"
    }
  ],

  // ========== TECHNOLOGIES & STACK ==========
  tech_stack: {
    primary: ["Rust 1.75+", "Lock-free Algorithms", "SIMD (AVX2/AVX-512)", "Atomic Operations"],
    hash_algorithms: ["XXHash3", "WyHash", "SipHash", "SIMD Batch Hasher"],
    concurrency: ["Lock-free Atomics", "Sharded Locking", "Striped Locking", "NUMA-aware"],
    optimization: ["CPU Prefetching", "Cache-line Alignment", "Register Blocking"],
    testing: ["Criterion.rs", "Quickcheck", "Property-based Testing"]
  },

  // ========== PROJECT INFO ==========
  info: {
    total_filters: 11,
    concurrent_variants: 3,
    specialized_variants: 4,
    hash_algorithms: 4,
    hash_strategies: 3
  },

  // ========== LINKS & RESOURCES ==========
  links: {
    github: "https://github.com/ZaudRehman/bloomcraft",
    documentation: "https://github.com/ZaudRehman/bloomcraft#readme"
  }
}

