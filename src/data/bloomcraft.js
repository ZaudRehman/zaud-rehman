export const bloomcraft = {
  // ========== HEADER ==========
  title: "BloomCraft",
  version: "v0.1.1",
  subtitle: "Production Bloom Filter Library",
  tagline: "Comprehensive probabilistic data structures library in Rust with 12 filter variants, pluggable hash system, and SIMD acceleration",

  // ========== CORE HIGHLIGHTS ==========
  highlights: [
    "12 production-grade filter variants covering every real-world use case (standard, counting, scalable, sharded, tree-based)",
    "Pluggable hash system: XXHash3, WyHash, FNV-1a, and SIMD vectorization for batch operations",
    "Enhanced Double Hashing reducing hash computations by 70% (Kirsch-Mitzenmacher 2006)",
    "Register-blocked memory layout for optimal cache performance",
    "Lock-free concurrent filters with multiple concurrency patterns",
    "Feature-gated metrics using relaxed atomic operations"
  ],

  // ========== ARCHITECTURE ==========
  architecture: {

    // --- CORE FILTER VARIANTS ---
    core_filters: [
      {
        name: "StandardBloomFilter",
        category: "Core",
        description: "Classic implementation with enhanced double hashing, optimal parameter calculation, and lock-free concurrent access",
        features: [
          "Lock-free concurrent insert/query via &self (AtomicU64)",
          "Enhanced Double Hashing (Kirsch-Mitzenmacher 2006)",
          "Optimal parameter calculation (minimal m, k formulas)",
          "Batch insert/query operations"
        ],
        use_case: "General-purpose sets with known item count",
        file: "standard.rs"
      },
      {
        name: "RegisterBlockedBloomFilter",
        category: "Performance",
        description: "Cache-optimized variant using 512-bit register blocks aligned to L1 cache lines",
        features: [
          "All k hash lookups within a single 64-byte block",
          "Guarantees at most one cache miss per query",
          "~1.3–1.5× memory overhead for maximum query speed"
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
          "Two-phase verification protocol for safe deletion"
        ],
        use_case: "Dynamic sets requiring remove operations (caches, session stores, TTL data)",
        file: "counting.rs"
      },
      {
        name: "ScalableBloomFilter",
        category: "Adaptive",
        description: "Auto-growing series of filters with exponentially tightening false positive rates (Almeida 2007)",
        features: [
          "Unbounded capacity (no rebuild required)",
          "Automatic growth at 50% fill threshold (proven optimal)",
          "FPR tightening per layer via error_ratio",
          "Configurable growth strategy (Geometric/Constant)"
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
          "Per-shard RwLock (reduced contention)",
          "Near-linear CPU scaling to hardware thread count",
          "Configurable shard count",
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
          "Stripe-level RwLocks (multiple concurrent writers)",
          "Reduced lock contention vs single global lock",
          "Cache-line padding to prevent false sharing",
          "Configurable stripe count"
        ],
        use_case: "High-contention shared filters with mixed read/write",
        file: "striped.rs"
      },
      {
        name: "AtomicPartitionedBloomFilter",
        category: "Concurrent",
        description: "Lock-free partitioned filter using AtomicU64 operations on cache-optimized regions",
        features: [
          "Zero locks (pure atomic operations with Relaxed ordering)",
          "Cache-optimized partition layout",
          "Lock-free insert, query, and batch operations"
        ],
        use_case: "Multi-threaded lookups where lock contention is unacceptable",
        file: "atomic_partitioned.rs"
      },
      {
        name: "AtomicScalableBloomFilter",
        category: "Concurrent",
        description: "Lock-free concurrent scalable filter with three-phase growth protocol and automatic sharding",
        features: [
          "Thread-safe insert/query via atomic operations",
          "Automatic shard count detection (num_cpus)",
          "Three-phase growth protocol (signal → prepare → commit)",
          "Per-shard RwLock for reduced contention during growth"
        ],
        use_case: "Multi-threaded ingestion pipelines with unbounded data streams",
        file: "atomic_scalable.rs"
      }
    ],

    // --- SPECIALIZED FILTER VARIANTS ---
    specialized_filters: [
      {
        name: "PartitionedBloomFilter",
        category: "Performance",
        description: "Cache-optimized variant splitting the bit array into k contiguous partitions for sequential memory access",
        features: [
          "1–2 cache misses per query vs k random misses",
          "Cache-line-aligned partition boundaries",
          "~2–5% higher FPR in exchange for ~2× query throughput",
          "Auto-tuned partition alignment via CPU cache detection"
        ],
        use_case: "Query-heavy workloads with cache-fit working sets",
        file: "partitioned.rs"
      },
      {
        name: "TreeBloomFilter",
        category: "Hierarchical",
        description: "Complete tree of Bloom filters for hierarchical membership with location tracking",
        features: [
          "Hash-prefix routing to deterministic leaf bins",
          "Pruned depth-first search for locate queries",
          "Root filter for fast coarse membership check",
          "Configurable branching vector at each depth"
        ],
        use_case: "Sharded caches, multi-tenant routing tables, prefix-partitioned membership indexes",
        file: "tree.rs"
      },
      {
        name: "ClassicHashBloomFilter",
        category: "Reference",
        description: "Burton Bloom's Method 1 (1970) — hash table with chaining using k truly independent hash functions",
        features: [
          "k independent hashes (academic standard)",
          "Hash table with chaining (not bit array)",
          "Benchmark baseline for comparisons",
          "Educational reference implementation"
        ],
        use_case: "Research, academic comparisons, benchmarking baseline",
        file: "classic_hash.rs"
      },
      {
        name: "ClassicBitsBloomFilter",
        category: "Reference",
        description: "Burton Bloom's Method 2 (1970) — bit array with k independent hashes (textbook algorithm)",
        features: [
          "Bit array with k independent hash functions",
          "Standard textbook algorithm",
          "Benchmark baseline for comparisons",
          "Educational reference implementation"
        ],
        use_case: "Compatibility mode, reference implementation, educational use",
        file: "classic_bits.rs"
      }
    ],

    // --- HASH SYSTEM ---
    hash_system: {
      overview: "Pluggable multi-algorithm hash system with SIMD acceleration and strategic index derivation",

      algorithms: [
        {
          name: "FNV-1a (StdHasher)",
          type: "Default Hasher",
          description: "Deterministic FNV-1a implementation — fast, fixed constants, zero external dependencies",
          characteristics: [
            "Default hash for all filter types",
            "Deterministic across processes and Rust versions",
            "Not cryptographically secure nor DoS-resistant",
            "No external dependencies"
          ],
          use_case: "General-purpose default; trusted input environments",
          file: "hasher.rs"
        },
        {
          name: "XXHash3",
          type: "Feature-gated Alternative",
          description: "State-of-the-art non-cryptographic hash designed by Yann Collet (requires xxhash feature)",
          characteristics: [
            "Extremely fast on modern CPUs",
            "Excellent avalanche properties",
            "SIMD-optimized (AVX2/AVX-512)",
            "Minimal collision rate"
          ],
          use_case: "Maximum throughput on multi-core systems via feature flag",
          file: "xxhash.rs"
        },
        {
          name: "WyHash",
          type: "Feature-gated Alternative",
          description: "Fastest known non-cryptographic hash designed by Wang Yi (requires wyhash feature)",
          characteristics: [
            "Fastest single-core performance",
            "Ultra-low collision rate",
            "Simple 64-bit multiplication",
            "Minimal CPU instructions"
          ],
          use_case: "Low-latency single-threaded workloads via feature flag",
          file: "wyhash.rs"
        },
        {
          name: "SIMD Batch Hasher",
          type: "Batch Optimization",
          description: "AVX2/AVX-512 vectorized batch hashing processing 4–8 items simultaneously",
          characteristics: [
            "Processes 4–8 items in parallel",
            "x86_64 AVX2/AVX-512 only",
            "Automatic CPU feature detection",
            "Graceful fallback to scalar path"
          ],
          use_case: "Batch insert/query operations, analytics workloads",
          file: "simd.rs"
        }
      ],

      strategies: [
        {
          name: "EnhancedDoubleHashing",
          algorithm: "Kirsch-Mitzenmacher optimization with entropy mixing",
          formula: "h_i(x) = (h1(x) + i · h2(x) + f(i³)) mod m",
          benefit: "Generates k indices from just 2 base hashes — 70% fewer hash computations",
          research_paper: "Kirsch & Mitzenmacher (2006) - Less Hashing, Same Performance",
          implementation: "strategies.rs"
        },
        {
          name: "TripleHashing",
          algorithm: "Extended double hashing with nonlinear term to eliminate clustering",
          formula: "h_i(x) = h1 + i·h2 + ((i³ XOR constant) >> shift) mod m",
          benefit: "Eliminates clustering at high load factors",
          implementation: "strategies.rs"
        },
        {
          name: "ClassicHashing",
          algorithm: "k truly independent hash functions (academic baseline)",
          formula: "h_i(x) = hash_i(x) mod m for i ∈ [0, k)",
          benefit: "Maximum hash independence — benchmark reference",
          use_case: "Research comparisons, empirical validation",
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
      technical_detail: "Each item maps to exactly one 512-bit block; all k indices computed within that block"
    },
    {
      name: "Enhanced Double Hashing",
      description: "Generate k indices from 2 base hashes using Kirsch-Mitzenmacher optimization with entropy mixing",
      technical_detail: "Reduces hash computations by 70% compared to k independent hashes"
    },
    {
      name: "SIMD Batch Hashing",
      description: "AVX2/AVX-512 vectorized hashing processing 4–8 items in parallel",
      technical_detail: "Automatic dispatch based on batch size and CPU features at runtime"
    },
    {
      name: "Lock-free Concurrent Patterns",
      description: "Atomic operations with Relaxed memory ordering for concurrent insert/query across multiple concurrency models",
      technical_detail: "Sharded (per-partition RwLock), Striped (fine-grained RwLock), Atomic (pure lock-free AtomicU64)"
    },
    {
      name: "Hierarchical Tree Filter",
      description: "Complete tree of Bloom filters enabling deterministic leaf routing and pruned subtree search",
      technical_detail: "Hash-prefix routing to leaf bins with depth-first pruning eliminates false subtree exploration"
    }
  ],

  // ========== TECHNOLOGIES & STACK ==========
  tech_stack: {
    primary: ["Rust 1.73+", "Lock-free Algorithms", "SIMD (AVX2/AVX-512)", "Atomic Operations"],
    hash_algorithms: ["XXHash3", "WyHash", "FNV-1a", "SIMD Batch Hasher"],
    concurrency: ["Lock-free Atomics", "Sharded Locking", "Striped Locking"],
    optimization: ["Cache-line Alignment", "Register Blocking", "Enhanced Double Hashing"],
    testing: ["Criterion.rs", "proptest", "Property-based Testing"]
  },

  // ========== PROJECT INFO ==========
  info: {
    total_filters: 12,
    concurrent_variants: 4,
    specialized_variants: 4,
    hash_algorithms: 4,
    hash_strategies: 3
  },

  // ========== LINKS & RESOURCES ==========
  links: {
    github: "https://github.com/ZaudRehman/bloomcraft",
    cratesio: "https://crates.io/crates/bloomcraft",
    documentation: "https://github.com/ZaudRehman/bloomcraft#readme"
  }
}
