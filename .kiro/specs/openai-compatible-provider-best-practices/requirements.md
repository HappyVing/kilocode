# Requirements Document

## Introduction

本文档总结了在实现 OpenAI Compatible Provider 配置功能时遇到的问题和最佳实践。这些经验教训可以帮助未来的开发避免类似的陷阱，并提供清晰的指导原则。

## Glossary

- **Provider**: API 提供商，如 OpenAI、Anthropic 等
- **Schema Validation**: 使用 Zod 进行的数据结构验证
- **Base URL**: API 端点的基础 URL
- **useEffect Hook**: React 的副作用钩子函数
- **Discriminated Union**: TypeScript 中的联合类型，通过特定字段区分不同类型

## Requirements

### Requirement 1: Schema 字段定义

**User Story:** 作为开发者，我需要正确定义 Zod schema 字段，以便系统能够正确验证和存储配置数据。

#### Acceptance Criteria

1. WHEN 添加新的配置字段 THEN 必须在对应的 provider schema 中使用 `z.string().optional()` 或其他适当的 Zod 类型定义
2. WHEN 定义 schema 字段 THEN 必须确保字段名称在整个代码库中保持一致
3. WHEN 修改 schema 定义 THEN 必须同时更新 TypeScript 类型定义和验证逻辑
4. WHEN schema 包含可选字段 THEN 必须使用 `.optional()` 而不是 `.nullish()` 除非明确需要 null 值
5. WHEN 添加新字段到 discriminated union THEN 必须确保该字段在所有相关的 schema 中都有定义

### Requirement 2: 验证逻辑一致性

**User Story:** 作为开发者，我需要确保验证逻辑与 schema 定义保持一致，以便用户能够成功创建和保存配置。

#### Acceptance Criteria

1. WHEN 定义必需字段 THEN 验证函数必须检查这些字段的存在性
2. WHEN 字段被锁定为固定值 THEN 验证逻辑应该排除对该字段的检查或自动设置默认值
3. WHEN 修改 schema 定义 THEN 必须同步更新 `validateModelsAndKeysProvided` 函数
4. WHEN 添加新的 provider THEN 必须在验证函数的 switch 语句中添加相应的 case
5. WHEN 字段有默认值 THEN 验证逻辑应该考虑到默认值的存在

### Requirement 3: React useEffect 使用规范

**User Story:** 作为开发者，我需要正确使用 useEffect 钩子，以避免无限循环和性能问题。

#### Acceptance Criteria

1. WHEN 使用 useEffect 设置初始值 THEN 依赖数组应该为空 `[]` 以确保只在挂载时执行一次
2. WHEN useEffect 修改状态 THEN 必须使用 `eslint-disable-next-line react-hooks/exhaustive-deps` 注释来明确表示有意忽略某些依赖
3. WHEN useEffect 中调用 setState THEN 必须确保不会触发无限循环
4. WHEN 需要在每次渲染时执行副作用 THEN 必须明确说明原因并谨慎使用
5. WHEN useEffect 依赖于 props THEN 必须评估是否会导致不必要的重新渲染

### Requirement 4: 测试数据类型正确性

**User Story:** 作为开发者，我需要确保测试数据的类型与实际代码保持一致，以便测试能够正确运行。

#### Acceptance Criteria

1. WHEN 编写单元测试 THEN mock 数据必须符合实际的 TypeScript 类型定义
2. WHEN 类型定义发生变化 THEN 必须同步更新所有相关的测试文件
3. WHEN 使用 mock 对象 THEN 必须包含所有必需的字段
4. WHEN 测试组件 props THEN 必须确保 mock props 的结构与组件期望的完全匹配
5. WHEN 运行 TypeScript 编译 THEN 测试文件不应该产生类型错误

### Requirement 5: 构建和编译流程

**User Story:** 作为开发者，我需要了解正确的构建流程，以便在修改代码后能够正确编译和测试。

#### Acceptance Criteria

1. WHEN 修改 TypeScript 类型定义 THEN 必须重新编译受影响的包
2. WHEN 修改 schema 定义 THEN 必须运行 `npm run bundle` 重新构建扩展
3. WHEN 修改 webview 组件 THEN 必须运行 `npm run build` 在 webview-ui 目录
4. WHEN 遇到类型错误 THEN 必须先修复类型问题再进行构建
5. WHEN 构建超时 THEN 应该检查是否有循环依赖或其他性能问题

### Requirement 6: 配置字段初始化

**User Story:** 作为开发者，我需要确保配置字段在组件加载时正确初始化，以避免验证失败。

#### Acceptance Criteria

1. WHEN 组件首次渲染 THEN 必需的配置字段应该被设置为默认值
2. WHEN 字段有固定值 THEN 应该在组件挂载时立即设置
3. WHEN 用户未输入某些字段 THEN 系统应该提供合理的默认值
4. WHEN 保存配置 THEN 所有必需字段必须已经被设置
5. WHEN 字段值被锁定 THEN 用户界面应该反映这一限制（如只读或隐藏）

### Requirement 7: 错误处理和调试

**User Story:** 作为开发者，我需要清晰的错误信息和调试方法，以便快速定位和解决问题。

#### Acceptance Criteria

1. WHEN schema 验证失败 THEN 错误信息应该明确指出哪个字段出现问题
2. WHEN 配置保存失败 THEN 应该记录详细的错误堆栈信息
3. WHEN 遇到类型错误 THEN 错误信息应该包含期望类型和实际类型
4. WHEN 调试配置问题 THEN 应该检查浏览器控制台和扩展日志
5. WHEN 验证逻辑失败 THEN 应该提供用户友好的错误提示

### Requirement 8: 代码组织和模块化

**User Story:** 作为开发者，我需要清晰的代码组织结构，以便于维护和扩展。

#### Acceptance Criteria

1. WHEN 添加新的 provider THEN 应该遵循现有的文件结构和命名约定
2. WHEN 定义 schema THEN 应该将相关的 schema 定义放在一起
3. WHEN 编写验证逻辑 THEN 应该将验证函数集中在一个文件中
4. WHEN 创建组件 THEN 应该将 UI 逻辑和业务逻辑分离
5. WHEN 修改共享类型 THEN 应该考虑对其他模块的影响

## 常见问题和解决方案

### 问题 1: "Failed to create api configuration"

**原因**: 验证函数要求的字段未被设置

**解决方案**:

- 在组件挂载时使用 useEffect 设置默认值
- 调整验证逻辑以匹配实际的字段要求
- 确保所有必需字段在保存前都有值

### 问题 2: "keyValidator.\_parse is not a function"

**原因**: Zod schema 定义错误或版本不兼容

**解决方案**:

- 检查 schema 定义语法是否正确
- 确保所有字段使用正确的 Zod 类型
- 重新编译 TypeScript 代码

### 问题 3: TypeScript 类型错误在测试文件中

**原因**: Mock 数据类型与实际类型定义不匹配

**解决方案**:

- 更新 mock 数据以匹配最新的类型定义
- 确保所有必需字段都包含在 mock 对象中
- 使用 TypeScript 的类型推断来验证 mock 数据

### 问题 4: useEffect 导致无限循环

**原因**: 依赖数组包含了会在每次渲染时变化的值

**解决方案**:

- 使用空依赖数组 `[]` 只在挂载时执行
- 使用 useCallback 或 useMemo 稳定化依赖
- 添加条件判断避免不必要的状态更新

### 问题 5: 构建超时

**原因**: TypeScript 编译过程中遇到大量错误或循环依赖

**解决方案**:

- 先修复所有 TypeScript 类型错误
- 检查是否有循环导入
- 分步构建各个包而不是一次性构建所有

## 最佳实践总结

1. **类型安全优先**: 始终确保 TypeScript 类型定义与运行时数据结构一致
2. **渐进式开发**: 先定义类型和 schema，再实现业务逻辑，最后编写测试
3. **验证一致性**: 保持 schema 定义、验证逻辑和 UI 表单的一致性
4. **测试驱动**: 在修改代码后立即运行测试，及早发现问题
5. **文档化决策**: 使用注释说明为什么做出某些设计决策
6. **错误处理**: 提供清晰的错误信息，帮助用户和开发者快速定位问题
7. **性能考虑**: 避免不必要的重新渲染和副作用执行
8. **代码审查**: 在提交前检查类型定义、验证逻辑和测试的一致性
