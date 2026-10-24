export const getCurrentUser=async (req,res)=>
{
    try {
        const user = req.user;
        return res.status(200).json({
            ...user,
            avatar: user.avatar || user.avataar,
        })
    } catch (error) {
        return res.status(500).json({message:`get current user error ${error}`})
    }
}