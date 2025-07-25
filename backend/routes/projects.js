const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  updateProjectCover,
} = require("../controllers/projectController");
const {
  authenticateToken,
  authorizeRole,
  authorizeOwnership,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const Project = require("../models/Project");

// Use enhanced auth middleware for backward compatibility
const auth = authenticateToken;

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private (Manager/Admin)
router.post(
  "/",
  authenticateToken,
  createProject
);

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get("/", auth, getProjects);

router.get("/:id", auth, getProject);

router.put("/:id", authenticateToken, authorizeOwnership(Project, "id"), updateProject);

router.delete("/:id", authenticateToken, authorizeOwnership(Project, "id"), deleteProject);

router.put("/:id/cover", authenticateToken, upload.uploadCoverImage, updateProjectCover);

module.exports = router;
