/**
 * 이미지 최적화 스크립트
 * PNG, JPG 이미지를 WebP로 변환하고 압축
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 이미지 최적화 설정
const OPTIMIZATION_CONFIG = {
  // WebP 변환 설정
  webp: {
    quality: 80,
    effort: 6,
  },
  // JPEG 압축 설정
  jpeg: {
    quality: 85,
    progressive: true,
  },
  // PNG 압축 설정
  png: {
    compressionLevel: 9,
    adaptiveFiltering: true,
  },
  // 최대 크기 설정
  maxWidth: 1024,
  maxHeight: 1024,
};

// 지원하는 이미지 형식
const SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.gif'];

// 최적화할 디렉토리들
const TARGET_DIRECTORIES = [
  './assets/images',
  './assets/fonts',
  './src/assets',
];

class ImageOptimizer {
  constructor() {
    this.processedFiles = 0;
    this.savedBytes = 0;
    this.errors = [];
  }

  /**
   * 이미지 최적화 실행
   */
  async optimizeImages() {
    console.log('🖼️  이미지 최적화 시작...');
    
    for (const dir of TARGET_DIRECTORIES) {
      if (fs.existsSync(dir)) {
        await this.processDirectory(dir);
      } else {
        console.log(`⚠️  디렉토리가 존재하지 않습니다: ${dir}`);
      }
    }

    this.printSummary();
  }

  /**
   * 디렉토리 처리
   */
  async processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        await this.processDirectory(itemPath);
      } else if (this.isImageFile(item)) {
        await this.optimizeImage(itemPath);
      }
    }
  }

  /**
   * 이미지 파일인지 확인
   */
  isImageFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return SUPPORTED_FORMATS.includes(ext);
  }

  /**
   * 개별 이미지 최적화
   */
  async optimizeImage(imagePath) {
    try {
      const originalSize = fs.statSync(imagePath).size;
      const ext = path.extname(imagePath).toLowerCase();
      const nameWithoutExt = path.basename(imagePath, ext);
      const dir = path.dirname(imagePath);
      
      let outputPath;
      let outputFormat;
      
      // WebP로 변환 (더 나은 압축률)
      if (ext !== '.webp') {
        outputPath = path.join(dir, `${nameWithoutExt}.webp`);
        outputFormat = 'webp';
      } else {
        // 이미 WebP인 경우 원본 유지
        return;
      }

      // 이미지 최적화
      const optimizedBuffer = await this.compressImage(imagePath, outputFormat);
      const optimizedSize = optimizedBuffer.length;
      
      // 원본보다 작은 경우에만 교체
      if (optimizedSize < originalSize) {
        fs.writeFileSync(outputPath, optimizedBuffer);
        
        // 원본 파일 삭제 (선택사항)
        // fs.unlinkSync(imagePath);
        
        this.processedFiles++;
        this.savedBytes += (originalSize - optimizedSize);
        
        console.log(`✅ ${path.basename(imagePath)} → ${path.basename(outputPath)} (${this.formatBytes(originalSize - optimizedSize)} 절약)`);
      } else {
        console.log(`⏭️  ${path.basename(imagePath)} (최적화 불필요)`);
      }
    } catch (error) {
      this.errors.push({ file: imagePath, error: error.message });
      console.error(`❌ ${path.basename(imagePath)}: ${error.message}`);
    }
  }

  /**
   * 이미지 압축
   */
  async compressImage(imagePath, format) {
    let pipeline = sharp(imagePath);
    
    // 크기 조정
    const metadata = await pipeline.metadata();
    if (metadata.width > OPTIMIZATION_CONFIG.maxWidth || metadata.height > OPTIMIZATION_CONFIG.maxHeight) {
      pipeline = pipeline.resize(OPTIMIZATION_CONFIG.maxWidth, OPTIMIZATION_CONFIG.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
    
    // 형식별 최적화
    switch (format) {
      case 'webp':
        return pipeline.webp(OPTIMIZATION_CONFIG.webp).toBuffer();
      case 'jpeg':
        return pipeline.jpeg(OPTIMIZATION_CONFIG.jpeg).toBuffer();
      case 'png':
        return pipeline.png(OPTIMIZATION_CONFIG.png).toBuffer();
      default:
        return pipeline.toBuffer();
    }
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

  /**
   * 요약 출력
   */
  printSummary() {
    console.log('\n📊 최적화 요약:');
    console.log(`   처리된 파일: ${this.processedFiles}개`);
    console.log(`   절약된 용량: ${this.formatBytes(this.savedBytes)}`);
    console.log(`   오류: ${this.errors.length}개`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ 오류 목록:');
      this.errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const optimizer = new ImageOptimizer();
  optimizer.optimizeImages().catch(console.error);
}

module.exports = ImageOptimizer;
