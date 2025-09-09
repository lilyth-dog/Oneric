/**
 * 번들 크기 분석 스크립트
 * React Native 번들의 크기와 구성 요소 분석
 */
const fs = require('fs');
const path = require('path');

class BundleAnalyzer {
  constructor() {
    this.bundlePath = './android/app/src/main/assets/index.android.bundle';
    this.analysis = {
      totalSize: 0,
      modules: [],
      largestModules: [],
      duplicateModules: [],
      unusedModules: [],
    };
  }

  /**
   * 번들 분석 실행
   */
  async analyzeBundle() {
    console.log('📦 번들 크기 분석 시작...');
    
    if (!fs.existsSync(this.bundlePath)) {
      console.log('❌ 번들 파일이 존재하지 않습니다. 먼저 번들을 생성해주세요.');
      console.log('   npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle');
      return;
    }

    const bundleContent = fs.readFileSync(this.bundlePath, 'utf8');
    this.analysis.totalSize = fs.statSync(this.bundlePath).size;
    
    await this.analyzeModules(bundleContent);
    await this.findLargestModules();
    await this.findDuplicateModules(bundleContent);
    await this.findUnusedModules();
    
    this.printAnalysis();
  }

  /**
   * 모듈 분석
   */
  async analyzeModules(bundleContent) {
    console.log('🔍 모듈 분석 중...');
    
    // 모듈 패턴 찾기
    const modulePattern = /__d\(function\(g,r,i,a,m,e,d\)\{[^}]*\},[^,]*,"([^"]+)",[^,]*,\[([^\]]*)\]/g;
    let match;
    
    while ((match = modulePattern.exec(bundleContent)) !== null) {
      const modulePath = match[1];
      const dependencies = match[2] ? match[2].split(',').map(dep => dep.trim().replace(/"/g, '')) : [];
      
      this.analysis.modules.push({
        path: modulePath,
        dependencies: dependencies,
        size: this.estimateModuleSize(match[0]),
      });
    }
  }

  /**
   * 모듈 크기 추정
   */
  estimateModuleSize(moduleCode) {
    return Buffer.byteLength(moduleCode, 'utf8');
  }

  /**
   * 가장 큰 모듈 찾기
   */
  async findLargestModules() {
    console.log('📏 큰 모듈 분석 중...');
    
    this.analysis.largestModules = this.analysis.modules
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
  }

  /**
   * 중복 모듈 찾기
   */
  async findDuplicateModules(bundleContent) {
    console.log('🔄 중복 모듈 분석 중...');
    
    const moduleCounts = {};
    
    this.analysis.modules.forEach(module => {
      const baseName = path.basename(module.path);
      if (!moduleCounts[baseName]) {
        moduleCounts[baseName] = [];
      }
      moduleCounts[baseName].push(module);
    });
    
    Object.keys(moduleCounts).forEach(baseName => {
      if (moduleCounts[baseName].length > 1) {
        this.analysis.duplicateModules.push({
          name: baseName,
          count: moduleCounts[baseName].length,
          modules: moduleCounts[baseName],
        });
      }
    });
  }

  /**
   * 사용되지 않는 모듈 찾기
   */
  async findUnusedModules() {
    console.log('🗑️  사용되지 않는 모듈 분석 중...');
    
    // 간단한 분석 (실제로는 더 복잡한 의존성 분석 필요)
    const usedModules = new Set();
    
    this.analysis.modules.forEach(module => {
      module.dependencies.forEach(dep => {
        usedModules.add(dep);
      });
    });
    
    this.analysis.unusedModules = this.analysis.modules.filter(module => {
      const baseName = path.basename(module.path, path.extname(module.path));
      return !usedModules.has(baseName) && !this.isEntryModule(module.path);
    });
  }

  /**
   * 진입점 모듈인지 확인
   */
  isEntryModule(modulePath) {
    return modulePath.includes('index.js') || 
           modulePath.includes('App.js') || 
           modulePath.includes('App.tsx');
  }

  /**
   * 분석 결과 출력
   */
  printAnalysis() {
    console.log('\n📊 번들 분석 결과:');
    console.log(`   총 크기: ${this.formatBytes(this.analysis.totalSize)}`);
    console.log(`   모듈 수: ${this.analysis.modules.length}개`);
    
    console.log('\n🔝 가장 큰 모듈 Top 10:');
    this.analysis.largestModules.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.path} (${this.formatBytes(module.size)})`);
    });
    
    if (this.analysis.duplicateModules.length > 0) {
      console.log('\n🔄 중복 모듈:');
      this.analysis.duplicateModules.forEach(duplicate => {
        console.log(`   ${duplicate.name}: ${duplicate.count}개 중복`);
        duplicate.modules.forEach(module => {
          console.log(`     - ${module.path}`);
        });
      });
    }
    
    if (this.analysis.unusedModules.length > 0) {
      console.log('\n🗑️  사용되지 않는 모듈:');
      this.analysis.unusedModules.forEach(module => {
        console.log(`   ${module.path} (${this.formatBytes(module.size)})`);
      });
    }
    
    this.printOptimizationSuggestions();
  }

  /**
   * 최적화 제안
   */
  printOptimizationSuggestions() {
    console.log('\n💡 최적화 제안:');
    
    // 번들 크기 기준 제안
    if (this.analysis.totalSize > 10 * 1024 * 1024) { // 10MB
      console.log('   ⚠️  번들 크기가 10MB를 초과합니다. 코드 스플리팅을 고려해보세요.');
    }
    
    // 큰 모듈 기준 제안
    const largeModules = this.analysis.largestModules.filter(m => m.size > 100 * 1024); // 100KB
    if (largeModules.length > 0) {
      console.log('   📦 큰 모듈들이 있습니다. 지연 로딩을 고려해보세요.');
    }
    
    // 중복 모듈 기준 제안
    if (this.analysis.duplicateModules.length > 0) {
      console.log('   🔄 중복 모듈이 있습니다. 의존성을 정리해보세요.');
    }
    
    // 사용되지 않는 모듈 기준 제안
    if (this.analysis.unusedModules.length > 0) {
      console.log('   🗑️  사용되지 않는 모듈이 있습니다. 제거를 고려해보세요.');
    }
    
    console.log('\n🛠️  최적화 명령어:');
    console.log('   npm run optimize:images  # 이미지 최적화');
    console.log('   npm run clean           # 캐시 정리');
    console.log('   npm run build:analyze   # 번들 분석');
  }

  /**
   * 바이트를 읽기 쉬운 형식으로 변환
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 스크립트 실행
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyzeBundle().catch(console.error);
}

module.exports = BundleAnalyzer;
