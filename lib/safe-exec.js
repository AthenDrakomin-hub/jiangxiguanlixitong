// safe-exec.js
/**
 * Safe execution utilities to prevent DEP0190 warnings and security issues
 * when using child_process functions
 */

import { spawn, exec } from 'child_process';
import { quote } from 'shell-quote';

/**
 * Safely spawn a child process without shell injection risks
 * @param {string} command - The command to execute
 * @param {string[]} args - Arguments for the command
 * @param {Object} options - Options for spawn
 * @returns {ChildProcess} - The spawned child process
 */
export function safeSpawn(command, args = [], options = {}) {
  // Remove shell: true option to prevent DEP0190 warning
  const safeOptions = { ...options };
  if (safeOptions.shell) {
    delete safeOptions.shell;
  }

  // Validate command and args
  if (typeof command !== 'string' || !command) {
    throw new Error('Command must be a non-empty string');
  }

  if (!Array.isArray(args)) {
    throw new Error('Arguments must be an array');
  }

  // Validate each argument
  for (const arg of args) {
    if (typeof arg !== 'string') {
      throw new Error('All arguments must be strings');
    }
  }

  return spawn(command, args, safeOptions);
}

/**
 * Safely execute a command with shell option enabled
 * @param {string} command - The command to execute
 * @param {string[]} args - Arguments for the command
 * @param {Object} options - Options for exec
 * @returns {ChildProcess} - The executed child process
 */
export function safeExecWithShell(command, args = [], options = {}) {
  // Combine command and args, then safely quote them
  const commandParts = [command, ...args];
  const safeCommand = quote(commandParts);

  const safeOptions = {
    ...options,
    shell: true,
  };

  return exec(safeCommand, safeOptions);
}

/**
 * Validate and sanitize location parameter for frontend generation
 * @param {string} location - The location parameter (e.g., room number)
 * @returns {string|null} - Sanitized location or null if invalid
 */
export function validateLocation(location) {
  if (!location) return null;

  // Only allow 4-digit room numbers (e.g., 8201, 8301, etc.)
  if (/^\d{4}$/.test(location)) {
    const roomNumber = parseInt(location, 10);
    // Valid room number ranges:
    // - 2nd floor: 8201-8232
    // - 3rd floor: 8301-8332
    if (
      (roomNumber >= 8201 && roomNumber <= 8232) ||
      (roomNumber >= 8301 && roomNumber <= 8332)
    ) {
      return location;
    }
  }

  return null;
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export function escapeHtml(str) {
  if (!str) return '';

  return str.replace(/[&<>"']/g, (match) => {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return escapeMap[match];
  });
}

export default {
  safeSpawn,
  safeExecWithShell,
  validateLocation,
  escapeHtml,
};
