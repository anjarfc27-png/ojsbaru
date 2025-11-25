#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprehensive but safe fix - handles multiple patterns at once
"""

import re
from pathlib import Path

def fix_file_comprehensive(file_path):
    """Comprehensively fix all common issues safely"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return False
    
    original = content
    
    # Fix 1: Remove duplicate export default (consecutive exact duplicates)
    lines = content.split('\n')
    new_lines = []
    prev_export = None
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Skip exact duplicate exports on consecutive lines
        if stripped.startswith('export default'):
            if prev_export and prev_export == stripped:
                i += 1
                continue
            prev_export = stripped
        else:
            prev_export = None
        
        new_lines.append(line)
        i += 1
    
    content = '\n'.join(new_lines)
    
    # Fix 2: Remove orphaned JSX after export default (specific pattern)
    # Pattern: export default ... followed by JSX attributes
    pattern1 = r'(export default[^\n]+)\n\s*(?:(?:value=|defaultChecked=|onChange=|fontSize:|color:|style=\{\{)[^\n]*)+\n*'
    content = re.sub(pattern1, r'\1\n', content, flags=re.MULTILINE)
    
    # Fix 3: Remove orphaned code after function closing brace
    # Only if followed by JSX attributes (very specific)
    pattern2 = r'(\}\s*\n)(\s*(?:value=|defaultChecked=|fontSize:|color:)[^\n]*\n)+'
    content = re.sub(pattern2, r'\1', content)
    
    # Fix 4: Fix incomplete function declarations (missing return/body)
    # This is more complex, so we'll do it line by line
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Check for incomplete function: "export default function Name() {" followed by JSX
        if re.match(r'export default (async )?function \w+\([^)]*\) \{?\s*$', stripped):
            # Look ahead to see if next non-empty line is JSX (not return statement)
            j = i + 1
            found_return = False
            found_jsx = False
            
            while j < len(lines) and j < i + 10:  # Check next 10 lines
                next_stripped = lines[j].strip()
                if not next_stripped:
                    j += 1
                    continue
                if 'return' in next_stripped:
                    found_return = True
                    break
                if next_stripped.startswith('<') or next_stripped.startswith('{'):
                    found_jsx = True
                    break
                if next_stripped.startswith('export') or next_stripped.startswith('function'):
                    break
                j += 1
            
            # If we found JSX but no return, add return
            if found_jsx and not found_return:
                fixed_lines.append(line)
                # Check if function declaration has opening brace
                if '{' not in stripped:
                    # Add opening brace
                    fixed_lines.append(' {')
                fixed_lines.append('  return (')
                i += 1
                continue
        
        fixed_lines.append(line)
        i += 1
    
    content = '\n'.join(fixed_lines)
    
    if content != original:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except:
            return False
    
    return False

def main():
    project_root = Path(__file__).parent
    src_dir = project_root / 'src'
    
    if not src_dir.exists():
        print(f"Source directory not found: {src_dir}")
        return
    
    fixed_count = 0
    total_files = 0
    
    print("Comprehensive safe fixing...")
    print("=" * 50)
    
    for ext in ['*.ts', '*.tsx']:
        for file_path in src_dir.rglob(ext):
            total_files += 1
            if fix_file_comprehensive(file_path):
                fixed_count += 1
                print(f"✓ {file_path.relative_to(project_root)}")
    
    print("=" * 50)
    print(f"Fixed {fixed_count}/{total_files} files")

if __name__ == '__main__':
    main()

