#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Safe and fast fix for duplicate/orphaned code - only fixes clear patterns
"""

import os
import re
from pathlib import Path

def fix_file_safe(file_path):
    """Safely fix clear duplicate/orphaned code patterns"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False
    
    original = content
    lines = content.split('\n')
    new_lines = []
    
    i = 0
    seen_exports = {}
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Pattern 1: Duplicate export default (exact match)
        if stripped.startswith('export default'):
            # Create a normalized key (remove extra spaces)
            normalized = re.sub(r'\s+', ' ', stripped)
            
            if normalized in seen_exports:
                # This is a duplicate - skip it
                print(f"    Removing duplicate export at line {i+1}")
                i += 1
                # Skip empty lines after duplicate
                while i < len(lines) and not lines[i].strip():
                    i += 1
                continue
            else:
                seen_exports[normalized] = i
        
        # Pattern 2: Orphaned JSX after export default (very specific pattern)
        if i > 0 and lines[i-1].strip().startswith('export default'):
            # Check if current line is orphaned JSX attribute
            if (stripped.startswith('value=') or 
                stripped.startswith('defaultChecked=') or
                stripped.startswith('onChange=') or
                stripped.startswith('fontSize:') or
                stripped.startswith('color:') or
                (stripped.startswith('style={{') and '}}' not in stripped)):
                # This is orphaned - skip until next valid line
                print(f"    Removing orphaned code after export at line {i+1}")
                while i < len(lines):
                    next_stripped = lines[i].strip()
                    if not next_stripped:
                        i += 1
                        continue
                    # Stop at next export/function/import
                    if (next_stripped.startswith('export ') or 
                        next_stripped.startswith('function ') or 
                        next_stripped.startswith('import ') or
                        next_stripped.startswith('type ') or
                        next_stripped.startswith('const ') and '=' in next_stripped):
                        break
                    # Stop if it's not clearly orphaned JSX
                    if not (next_stripped.startswith('<') or 
                           next_stripped.startswith('value=') or 
                           next_stripped.startswith('defaultChecked=') or
                           next_stripped.startswith('fontSize:') or
                           next_stripped.startswith('color:') or
                           next_stripped.startswith('style={{')):
                        break
                    i += 1
                continue
        
        # Pattern 3: Orphaned code after function closing brace
        if stripped == '}' and i > 0:
            # Look ahead for orphaned JSX
            j = i + 1
            found_orphaned = False
            
            while j < len(lines):
                next_stripped = lines[j].strip()
                if not next_stripped:
                    j += 1
                    continue
                # Check if it's a new declaration
                if (next_stripped.startswith('export ') or 
                    next_stripped.startswith('function ') or 
                    next_stripped.startswith('import ') or
                    next_stripped.startswith('type ') or
                    (next_stripped.startswith('const ') and '=' in next_stripped)):
                    break
                # Check if clearly orphaned
                if (next_stripped.startswith('value=') or 
                    next_stripped.startswith('defaultChecked=') or
                    next_stripped.startswith('fontSize:') or
                    next_stripped.startswith('color:') or
                    (next_stripped.startswith('style={{') and '}}' not in next_stripped)):
                    if not found_orphaned:
                        print(f"    Removing orphaned code after function end at line {j+1}")
                        found_orphaned = True
                    j += 1
                else:
                    break
            
            if found_orphaned:
                new_lines.append(line)
                i = j
                continue
        
        new_lines.append(line)
        i += 1
    
    new_content = '\n'.join(new_lines)
    
    # Additional safe cleanup: remove exact duplicate export lines
    # Only if they appear on consecutive lines
    lines_final = new_content.split('\n')
    final_lines = []
    prev_line = None
    
    for line in lines_final:
        stripped = line.strip()
        if stripped.startswith('export default'):
            if prev_line and prev_line.strip() == stripped:
                # Skip exact duplicate on consecutive lines
                continue
        final_lines.append(line)
        prev_line = line
    
    new_content = '\n'.join(final_lines)
    
    if new_content != original:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        except Exception as e:
            print(f"    Error writing: {e}")
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
    
    print("Safe fast fixing all files...")
    print("=" * 50)
    
    for ext in ['*.ts', '*.tsx']:
        for file_path in src_dir.rglob(ext):
            total_files += 1
            if fix_file_safe(file_path):
                fixed_count += 1
                print(f"✓ Fixed: {file_path.relative_to(project_root)}")
    
    print("=" * 50)
    print(f"\nFixed {fixed_count} out of {total_files} files")
    print("Safe and fast!")

if __name__ == '__main__':
    main()


