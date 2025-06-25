import { useEffect, useState } from "react"
import { Box, Typography, Grid, Card, CardContent, Chip } from "@mui/material"
import { getPendingRentOrders } from "../../../api/order"
import { formatDate } from "../../../utils/commonFunc"

const RentrentListCard = () => {
    const [pendingRents, setPendingRent] = useState([])

    useEffect(() => {
        fetchAllPendingRents()
    }, [])
    const fetchAllPendingRents = async () => {
        try {
            const result = await getPendingRentOrders();
            const onlyRentOrders = result?.filter(rent => rent.orderType === "Rent");
            console.log("Fetched pending rent orders:", result);
            setPendingRent(onlyRentOrders || []);
        } catch (error) {
            console.error("Error fetching rent orders:", error);
        }
    };
    return (
        <Box p={3}>
            <Typography variant="h5" mb={2} fontWeight={600}> pending Rent Orders</Typography>

            <Grid container spacing={3}>
                {pendingRents.map((rent, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card variant="outlined"
                            sx={{
                                width: 250,
                                height: 260,
                                borderRadius: 2,
                                boxShadow: 1,
                                transition: "0.3s",
                                "&:hover": {
                                    boxShadow: 4,
                                },
                            }}>

                            <CardContent>
                                <Box mb={1}>
                                    <Chip
                                        label={rent.orderStatus}
                                        color={rent.orderStatus === "ORDER_PENDING" ? "warning" : "success"}
                                        size="small"

                                    />
                                </Box>
                                <Typography variant="h6" gutterBottom fontWeight={300}>
                                    {rent.inventoryName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Created At: {new Date(rent.createdAt).toLocaleDateString()}
                                </Typography>
                                <Typography variant="h7" gutterBottom>
                                    {rent.customerName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={0.5}>
                                    {formatDate(rent.dueDateTime) ?? "--"}
                                </Typography>
                                <Typography variant="body2">
                                    Total Price: ₹{rent.price * rent.quantity}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}
export default RentrentListCard