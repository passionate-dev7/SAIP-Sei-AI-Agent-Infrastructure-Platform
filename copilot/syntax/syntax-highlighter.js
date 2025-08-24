import TreeSitter from 'tree-sitter';
import Move from 'tree-sitter-move';

export class SyntaxHighlighter {
  constructor() {
    this.parser = new TreeSitter();
    this.parser.setLanguage(Move);
    this.initializeTheme();
  }

  initializeTheme() {
    this.theme = {
      keyword: '#569cd6',
      type: '#4ec9b0',
      string: '#ce9178',
      number: '#b5cea8',
      comment: '#6a9955',
      function: '#dcdcaa',
      variable: '#9cdcfe',
      operator: '#d4d4d4',
      delimiter: '#d4d4d4',
      error: '#f44747'
    };
  }

  async highlight(code) {
    try {
      const tree = this.parser.parse(code);
      const highlights = this.traverseTree(tree.rootNode, code);
      return {
        highlights,
        tokens: this.generateTokens(tree.rootNode, code)
      };
    } catch (error) {
      console.error('Syntax highlighting error:', error);
      return { highlights: [], tokens: [] };
    }
  }

  traverseTree(node, code) {
    const highlights = [];
    
    if (node.type !== 'ERROR') {
      const color = this.getColorForNodeType(node.type);
      if (color) {
        highlights.push({
          start: node.startIndex,
          end: node.endIndex,
          color,
          type: node.type,
          text: code.slice(node.startIndex, node.endIndex)
        });
      }
    }

    for (const child of node.children) {
      highlights.push(...this.traverseTree(child, code));
    }

    return highlights;
  }

  getColorForNodeType(nodeType) {
    const keywordTypes = [
      'module', 'struct', 'fun', 'public', 'entry', 'native', 'friend',
      'has', 'copy', 'drop', 'store', 'key', 'mut', 'let', 'const',
      'if', 'else', 'while', 'loop', 'break', 'continue', 'return',
      'move', 'copy', 'use', 'as', 'spec', 'global', 'exists',
      'borrow_global', 'borrow_global_mut', 'move_from', 'move_to'
    ];

    const typeTypes = [
      'bool', 'u8', 'u64', 'u128', 'address', 'vector', 'signer',
      'type_parameter', 'primitive_type', 'type_name'
    ];

    if (keywordTypes.includes(nodeType)) {
      return this.theme.keyword;
    }
    
    if (typeTypes.includes(nodeType)) {
      return this.theme.type;
    }

    switch (nodeType) {
      case 'string_literal':
        return this.theme.string;
      case 'number_literal':
      case 'hex_literal':
      case 'byte_literal':
        return this.theme.number;
      case 'comment':
      case 'line_comment':
      case 'block_comment':
        return this.theme.comment;
      case 'function_name':
      case 'function_definition':
        return this.theme.function;
      case 'identifier':
        return this.theme.variable;
      case 'operator':
        return this.theme.operator;
      case 'delimiter':
        return this.theme.delimiter;
      case 'ERROR':
        return this.theme.error;
      default:
        return null;
    }
  }

  generateTokens(node, code) {
    const tokens = [];
    
    const addToken = (start, end, type) => {
      tokens.push({
        start,
        end,
        type,
        text: code.slice(start, end)
      });
    };

    this.traverseForTokens(node, addToken);
    return tokens.sort((a, b) => a.start - b.start);
  }

  traverseForTokens(node, addToken) {
    if (node.childCount === 0) {
      addToken(node.startIndex, node.endIndex, node.type);
    } else {
      for (const child of node.children) {
        this.traverseForTokens(child, addToken);
      }
    }
  }

  async getCompletions(code, position) {
    try {
      const tree = this.parser.parse(code);
      const nodeAt = this.getNodeAtPosition(tree.rootNode, position);
      
      const context = this.analyzeContext(nodeAt, code);
      const completions = this.generateCompletions(context);

      return {
        completions,
        context: context.type,
        range: {
          start: context.start,
          end: context.end
        }
      };
    } catch (error) {
      console.error('Completion error:', error);
      return { completions: [], context: 'unknown', range: null };
    }
  }

  getNodeAtPosition(node, position) {
    if (position < node.startIndex || position > node.endIndex) {
      return null;
    }

    for (const child of node.children) {
      const childNode = this.getNodeAtPosition(child, position);
      if (childNode) return childNode;
    }

    return node;
  }

  analyzeContext(node, code) {
    if (!node) {
      return { type: 'global', completions: this.getGlobalCompletions() };
    }

    const parentType = node.parent?.type;
    const nodeType = node.type;

    // Function context
    if (parentType === 'function_definition' || this.isInFunction(node)) {
      return {
        type: 'function',
        start: node.startIndex,
        end: node.endIndex,
        completions: this.getFunctionCompletions()
      };
    }

    // Module context
    if (parentType === 'module' || this.isInModule(node)) {
      return {
        type: 'module',
        start: node.startIndex,
        end: node.endIndex,
        completions: this.getModuleCompletions()
      };
    }

    // Type context
    if (nodeType === 'type_name' || this.isTypeContext(node)) {
      return {
        type: 'type',
        start: node.startIndex,
        end: node.endIndex,
        completions: this.getTypeCompletions()
      };
    }

    // Expression context
    return {
      type: 'expression',
      start: node.startIndex,
      end: node.endIndex,
      completions: this.getExpressionCompletions()
    };
  }

  isInFunction(node) {
    let current = node;
    while (current) {
      if (current.type === 'function_definition') return true;
      current = current.parent;
    }
    return false;
  }

  isInModule(node) {
    let current = node;
    while (current) {
      if (current.type === 'module') return true;
      current = current.parent;
    }
    return false;
  }

  isTypeContext(node) {
    const typeContexts = ['type_annotation', 'generic_type', 'function_parameter'];
    return typeContexts.includes(node.parent?.type);
  }

  generateCompletions(context) {
    const baseCompletions = this.getBaseCompletions();
    
    switch (context.type) {
      case 'global':
        return [...baseCompletions, ...this.getGlobalCompletions()];
      case 'module':
        return [...baseCompletions, ...this.getModuleCompletions()];
      case 'function':
        return [...baseCompletions, ...this.getFunctionCompletions()];
      case 'type':
        return this.getTypeCompletions();
      case 'expression':
        return [...baseCompletions, ...this.getExpressionCompletions()];
      default:
        return baseCompletions;
    }
  }

  getBaseCompletions() {
    return [
      { label: 'module', kind: 'keyword', detail: 'Define a module' },
      { label: 'struct', kind: 'keyword', detail: 'Define a struct' },
      { label: 'fun', kind: 'keyword', detail: 'Define a function' },
      { label: 'public', kind: 'keyword', detail: 'Public visibility' },
      { label: 'entry', kind: 'keyword', detail: 'Entry function' },
      { label: 'native', kind: 'keyword', detail: 'Native function' },
      { label: 'friend', kind: 'keyword', detail: 'Friend visibility' }
    ];
  }

  getGlobalCompletions() {
    return [
      {
        label: 'module_template',
        kind: 'snippet',
        insertText: `module ${1:module_name} {\n    \$0\n}`,
        detail: 'Module template'
      }
    ];
  }

  getModuleCompletions() {
    return [
      {
        label: 'struct_template',
        kind: 'snippet',
        insertText: `struct \${1:StructName} {\n    \${2:field}: \${3:type}\n}`,
        detail: 'Struct template'
      },
      {
        label: 'function_template',
        kind: 'snippet',
        insertText: `public fun \${1:function_name}(\${2:param}: \${3:type}): \${4:return_type} {\n    \$0\n}`,
        detail: 'Public function template'
      },
      {
        label: 'entry_function',
        kind: 'snippet',
        insertText: `public entry fun \${1:function_name}(\${2:account}: &signer) {\n    \$0\n}`,
        detail: 'Entry function template'
      }
    ];
  }

  getFunctionCompletions() {
    return [
      { label: 'let', kind: 'keyword', detail: 'Variable binding' },
      { label: 'mut', kind: 'keyword', detail: 'Mutable reference' },
      { label: 'if', kind: 'keyword', detail: 'Conditional statement' },
      { label: 'while', kind: 'keyword', detail: 'While loop' },
      { label: 'loop', kind: 'keyword', detail: 'Infinite loop' },
      { label: 'return', kind: 'keyword', detail: 'Return statement' },
      { label: 'abort', kind: 'keyword', detail: 'Abort execution' },
      { label: 'assert!', kind: 'function', detail: 'Assertion macro' },
      { label: 'vector::empty', kind: 'function', detail: 'Create empty vector' },
      { label: 'vector::push_back', kind: 'function', detail: 'Add element to vector' },
      { label: 'borrow_global', kind: 'function', detail: 'Borrow global resource' },
      { label: 'move_to', kind: 'function', detail: 'Move resource to account' }
    ];
  }

  getTypeCompletions() {
    return [
      { label: 'bool', kind: 'type', detail: 'Boolean type' },
      { label: 'u8', kind: 'type', detail: '8-bit unsigned integer' },
      { label: 'u64', kind: 'type', detail: '64-bit unsigned integer' },
      { label: 'u128', kind: 'type', detail: '128-bit unsigned integer' },
      { label: 'address', kind: 'type', detail: 'Address type' },
      { label: 'signer', kind: 'type', detail: 'Signer type' },
      { label: 'vector', kind: 'type', detail: 'Vector type' },
      { label: '&', kind: 'operator', detail: 'Immutable reference' },
      { label: '&mut', kind: 'operator', detail: 'Mutable reference' }
    ];
  }

  getExpressionCompletions() {
    return [
      { label: 'copy', kind: 'keyword', detail: 'Copy value' },
      { label: 'move', kind: 'keyword', detail: 'Move value' },
      { label: 'freeze', kind: 'keyword', detail: 'Freeze mutable reference' },
      { label: 'true', kind: 'constant', detail: 'Boolean true' },
      { label: 'false', kind: 'constant', detail: 'Boolean false' }
    ];
  }

  async validateSyntax(code) {
    try {
      const tree = this.parser.parse(code);
      const errors = this.findSyntaxErrors(tree.rootNode);
      
      return {
        isValid: errors.length === 0,
        errors: errors.map(error => ({
          line: error.startPosition.row + 1,
          column: error.startPosition.column + 1,
          message: this.getErrorMessage(error),
          severity: 'error',
          range: {
            start: error.startIndex,
            end: error.endIndex
          }
        }))
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          line: 1,
          column: 1,
          message: 'Failed to parse code: ' + error.message,
          severity: 'error'
        }]
      };
    }
  }

  findSyntaxErrors(node) {
    const errors = [];
    
    if (node.type === 'ERROR') {
      errors.push(node);
    }

    for (const child of node.children) {
      errors.push(...this.findSyntaxErrors(child));
    }

    return errors;
  }

  getErrorMessage(errorNode) {
    const errorMessages = {
      'ERROR': 'Syntax error',
      'MISSING': 'Missing token',
      'UNEXPECTED': 'Unexpected token'
    };

    return errorMessages[errorNode.type] || 'Unknown syntax error';
  }

  async formatCode(code, options = {}) {
    // Basic formatting rules for Move
    const defaultOptions = {
      indentSize: 4,
      maxLineLength: 100,
      insertFinalNewline: true,
      trimTrailingWhitespace: true
    };

    const config = { ...defaultOptions, ...options };
    
    try {
      const tree = this.parser.parse(code);
      const formatted = this.formatNode(tree.rootNode, code, 0, config);
      
      return {
        formatted,
        changes: this.calculateChanges(code, formatted)
      };
    } catch (error) {
      console.error('Formatting error:', error);
      return { formatted: code, changes: [] };
    }
  }

  formatNode(node, code, depth, config) {
    const indent = ' '.repeat(depth * config.indentSize);
    
    // This is a simplified formatter - a full implementation would be much more complex
    switch (node.type) {
      case 'module':
        return this.formatModule(node, code, depth, config);
      case 'struct_definition':
        return this.formatStruct(node, code, depth, config);
      case 'function_definition':
        return this.formatFunction(node, code, depth, config);
      default:
        return code.slice(node.startIndex, node.endIndex);
    }
  }

  formatModule(node, code, depth, config) {
    const indent = ' '.repeat(depth * config.indentSize);
    const content = code.slice(node.startIndex, node.endIndex);
    
    // Basic module formatting
    return content
      .split('\n')
      .map((line, index) => {
        if (index === 0) return line;
        return line.trim() ? indent + line.trim() : '';
      })
      .join('\n');
  }

  formatStruct(node, code, depth, config) {
    // Struct formatting logic
    return code.slice(node.startIndex, node.endIndex);
  }

  formatFunction(node, code, depth, config) {
    // Function formatting logic
    return code.slice(node.startIndex, node.endIndex);
  }

  calculateChanges(original, formatted) {
    const changes = [];
    // Simple diff calculation - in practice, you'd use a proper diff algorithm
    if (original !== formatted) {
      changes.push({
        range: { start: 0, end: original.length },
        text: formatted
      });
    }
    return changes;
  }
}